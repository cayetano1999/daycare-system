import { Component, inject, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';
import { Guest } from '../../event-guests.page';
import { Profile } from 'src/app/core/interface/profile.interface';
import { AlertControllerService } from 'src/app/core/services/ionic/alert-controller.service';
import { FestivaEvent } from 'src/app/core/interface/event.interface';

interface Group {
  id: string;
  name: string;
  color_exa: string;
}

interface Table {
  id: string;
  name: string;
  capacity: number;
  available?: number; // Espacios disponibles
}

interface FormErrors {
  name?: string;
  table?: string;
}

@Component({
  selector: 'app-import-guests-modal',
  templateUrl: './import-guests-modal.component.html',
  styleUrls: ['./import-guests-modal.component.scss'],
  imports: [...StandAloneModules]
})
export class ImportGuestsModalComponent implements OnInit {
  selectedFile: File | null = null;
  fileInfo: any | null = null;
  csvData: string[][] = [];
  csvHeaders: string[] = [];

  isLoading: boolean = false;
  isProcessing: boolean = false;
  isDragOver: boolean = false;

  @Input() event!: FestivaEvent;
  @Input() user!: Profile;

  private modalController = inject(ModalController);
  private supabase = inject(SupabaseService);
  private alertCtrl = inject(AlertControllerService);


  // Configuración
  maxFileSize: number = 10 * 1024 * 1024; // 10MB
  allowedTypes: string[] = ['.csv', 'text/csv', 'application/csv'];

  constructor() { }

  ngOnInit() {
    // Inicialización del componente
  }

  /**
   * Maneja el evento de selección de archivo
   * @param event - Evento del input file
   */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.handleFile(file);
    }
  }

  /**
   * Maneja el evento de drag over
   * @param event - Evento de drag
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  /**
   * Maneja el evento de drag leave
   * @param event - Evento de drag
   */
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  /**
   * Maneja el evento de drop
   * @param event - Evento de drop
   */
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  /**
   * Procesa el archivo seleccionado
   * @param file - Archivo seleccionado
   */
  private handleFile(file: File): void {
    // Validar tipo de archivo
    if (!this.isValidFileType(file)) {
      this.showError('Por favor selecciona un archivo CSV válido');
      return;
    }

    // Validar tamaño
    if (file.size > this.maxFileSize) {
      this.showError('El archivo es demasiado grande. Máximo 10MB permitido');
      return;
    }

    this.selectedFile = file;
    this.isLoading = true;

    // Simular carga (en una app real, aquí procesarías el archivo)
    setTimeout(() => {
      this.isLoading = false;
      this.generateFileInfo(file);
    }, 1500);
  }

  /**
   * Valida si el tipo de archivo es correcto
   * @param file - Archivo a validar
   * @returns boolean
   */
  private isValidFileType(file: File): boolean {
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();

    return fileName.endsWith('.csv') ||
      fileType === 'text/csv' ||
      fileType === 'application/csv' ||
      fileType === '';
  }

  /**
   * Genera la información del archivo
   * @param file - Archivo procesado
   */
  private async generateFileInfo(file: File) {
    this.isProcessing = true;
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n').filter(line => line.trim() !== '');
        this.fileInfo = {
          records: lines.length > 1 ? lines.length - 1 : 0, // excluye header
          size: this.formatFileSize(file.size),
          name: file.name
        };
        this.parseCsv(csv);
      } catch (error) {
        console.error('Error procesando archivo:', error);
        this.showError('Error al procesar el archivo CSV');
      } finally {
        this.isProcessing = false;
      }
    };

    reader.onerror = () => {
      this.showError('Error al leer el archivo');
      this.isProcessing = false;
    };

    reader.readAsText(file);
  }

  /**
   * Procesa el archivo CSV
   */
  async processFile(): Promise<void> {
    if (!this.selectedFile) { return; }

    await this.importGuestsCsvAsJson(this.selectedFile, this.event?.id || '', this.user.id)

  }

  /**
   * Parsea el contenido CSV
   * @param csvContent - Contenido del archivo CSV
   */
  private parseCsv(csvContent: string): void {
    const lines = csvContent.split('\n').filter(line => line.trim() !== '');

    if (lines.length === 0) {
      this.showError('El archivo CSV está vacío');
      return;
    }

    // Extraer headers (primera línea)
    this.csvHeaders = this.parseCsvLine(lines[0]);

    // Extraer datos (resto de líneas)
    this.csvData = lines.slice(1).map(line => this.parseCsvLine(line));

    // Actualizar información del archivo
    if (this.fileInfo) {
      this.fileInfo.records = this.csvData.length;
    }

    console.log('CSV procesado:', {
      headers: this.csvHeaders,
      records: this.csvData.length,
      preview: this.csvData.slice(0, 3)
    });
  }

  /**
   * Parsea una línea CSV
   * @param line - Línea a parsear
   * @returns Array de strings
   */
  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  /**
   * Formatea el tamaño del archivo
   * @param bytes - Tamaño en bytes
   * @returns String formateado
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Limpia el archivo seleccionado
   */
  clearFile(): void {
    this.selectedFile = null;
    this.fileInfo = null;
    this.csvData = [];
    this.csvHeaders = [];
    this.isLoading = false;
    this.isProcessing = false;
  }

  /**
   * Muestra un mensaje de error
   * @param message - Mensaje a mostrar
   */
  private showError(message: string): void {
    console.error(message);
    // Aquí puedes implementar un toast o alert
    // Por ejemplo: this.toastController.create({ message, color: 'danger' })
  }

  /**
   * Obtiene los datos procesados para usar en otros componentes
   * @returns Datos del CSV
   */
  getCsvData(): { headers: string[], data: string[][] } {
    return {
      headers: this.csvHeaders,
      data: this.csvData
    };
  }

  /**
   * Valida si hay datos cargados
   * @returns boolean
   */
  hasData(): boolean {
    return this.csvData.length > 0 && this.csvHeaders.length > 0;
  }

  /**
   * Exporta los datos procesados
   * @returns Objeto con información completa
   */
  exportData(): any {
    if (!this.hasData()) return null;

    return {
      file: {
        name: this.selectedFile?.name,
        size: this.selectedFile?.size,
        type: this.selectedFile?.type
      },
      info: this.fileInfo,
      headers: this.csvHeaders,
      data: this.csvData,
      summary: {
        totalRecords: this.csvData.length,
        totalColumns: this.csvHeaders.length,
        processedAt: new Date().toISOString()
      }
    };
  }

  get previewCount(): number {
    return Math.min(5, this.csvData.length) || 0;
  }

  async importGuestsCsvAsJson(file: File, eventId: string, invitedBy: string) {

    await this.alertCtrl.openModalAlert();
    const csvText = await file.text();
    const { data, error } = await this.supabase.getSupabase().functions.invoke('import-guests', {
      body: {
        csv: csvText,
        event_id: eventId,
        // invited_by: invitedBy
      }
    });

    if (error) {
      this.isProcessing = false;
      this.alertCtrl.dismiss();
      await this.alertCtrl.openFestivaAlert('danger', 'Error', 'No se pudieron importar los invitados. Revisa el archivo e intenta nuevamente.');
      console.error('Error importing guests:', error);

    }


      this.alertCtrl.dismiss();

    const { failed_count, inserted_count } = data as { failed_count: number, inserted_count: number };

    let message = `Se importaron ${inserted_count} invitados correctamente.`;
    if (failed_count > 0) {
      message += ` Sin embargo, ${failed_count} registros no se pudieron importar debido a errores en los datos.`;
    }
    this.isProcessing = false; 
    await this.alertCtrl.openFestivaAlert('success', 'Importación Completa', message);
     // Cierra el modal y retorna true para indicar éxito
    this.closeModal();
    return data;
  }

   async closeModal() {
    try {
      await this.modalController.dismiss({ success: true });
      console.log('Modal cerrado');
    } catch (error) {
      console.error('Error closing modal:', error);
    }
  }
}