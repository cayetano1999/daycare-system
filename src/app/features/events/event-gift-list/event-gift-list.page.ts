import { Component, OnInit, Input, ViewChild, ElementRef, inject } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { StorageHelper } from 'src/app/core/helpers/storage.helper';
import { Router } from '@angular/router';
import { FestivaEvent } from 'src/app/core/interface/event.interface';
import { Profile } from 'src/app/core/interface/profile.interface';
import { StorageKeys } from 'src/app/core/enums/storage.keys.enum';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';
import { GiftItemModalComponent } from './components/gift-item-modal/gift-item-modal.component';
import Papa from 'papaparse';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { RoleAccessDirective } from 'src/app/shared/directives/role-access.directive';
import { AlertControllerService } from 'src/app/core/services/ionic/alert-controller.service';

interface GiftItem {
  article_code?: string;
  article_name: string;
  bought: boolean;
}

interface GiftListData {
  id?: string;
  name: string;
  items: GiftItem[];
  store_names: string[];
  description: string;
  share_message: string;
  code: string;
  event_id: string;
  user_id?: string;
  created_at?: string;
}

@Component({
  selector: 'app-gift-list',
  templateUrl: './event-gift-list.page.html',
  styleUrls: ['./event-gift-list.page.scss'],
  imports: [...StandAloneModules, GiftItemModalComponent, RoleAccessDirective]
})
export class GiftListPage implements OnInit {
  @Input() eventId: string = '';
  @Input() eventName: string = '';
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  giftList: GiftListData = {
    name: 'Mi Lista de Regalos',
    items: [],
    store_names: [],
    description: '',
    share_message: 'Mi lista de regalos',
    code: 'N/A',
    event_id: ''
  };

  showItemModal = false;
  editingItem: GiftItem | null = null;
  editingItemIndex: number | null = null;
  showDeleteConfirm = false;
  itemToDelete: number | null = null;
  showExportOptions = false;

  isLoadingData = true;
  isImporting = false;
  isExporting = false;
  newStoreName = '';
  event: FestivaEvent | null = null;
  user: Profile | null = null;
  isIos = Capacitor.getPlatform() === 'ios';

  private alertController = inject(AlertController);
  private supabaseService = inject(SupabaseService);
  private storageHelper = inject(StorageHelper);
  private router = inject(Router);
  private readonly alertCtrlService = inject(AlertControllerService);

  /**
   *
   */
  constructor() {

  }

  ngOnInit() {
    // Component initialization
  }

  async ionViewWillEnter() {
    const state = this.router.getCurrentNavigation()?.extras?.state ?? history.state;
    if (state?.event) this.event = state.event;

    if (this.event) {
      this.eventId = this.event.id || '';
    }
    this.user = await this.storageHelper.getStorageKey(StorageKeys.USER_DATA);
    await this.loadGiftListData();
  }

  async loadGiftListData() {
    this.isLoadingData = true;

    try {
      // Check if gift list exists for this event and user
      const { data: existingList, error: fetchError } = await this.supabaseService.getRecord(
        'gift_list',
        ['*'],
        'event_id',
        this.eventId
      ) as any;

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingList) {
        // Record exists, load data
        this.giftList = {
          ...existingList,
          items: existingList.items || [],
          store_names: existingList.store_names || []
        };
      } else {
        // No record exists, create one automatically
        await this.createInitialGiftList();
      }
    } catch (error: any) {
      console.error('Error loading gift list data:', error);


      await this.alertCtrlService.openFestivaAlert('danger', 'Error', 'No se pudo cargar la lista de regalos del evento. Intenta nuevamente más tarde.', false, 'OK');

    } finally {
      this.isLoadingData = false;
    }
  }

  async createInitialGiftList() {
    try {
      const newGiftList = {
        name: 'Mi Lista de Regalos',
        items: [],
        store_names: [],
        description: '',
        share_message: 'Mi lista de regalos',
        code: 'N/A',
        event_id: this.eventId,
        user_id: this.user?.id || ''
      };

      const { data, error } = await this.supabaseService.createRecord('gift_list', newGiftList);

      if (error) {
        throw error;
      }

      this.giftList = {
        ...data,
        items: data.items || [],
        store_names: data.store_names || []
      };
    } catch (error) {
      console.error('Error creating initial gift list:', error);
      throw error;
    }
  }

  async updateGiftList() {
    if (!this.giftList.id) return;

    try {
      const updateData = {
        id: this.giftList.id,
        name: this.giftList.name,
        items: this.giftList.items,
        store_names: this.giftList.store_names,
        description: this.giftList.description,
        share_message: this.giftList.share_message,
        code: this.giftList.code,
        event_id: this.eventId,
        user_id: this.user?.id || ''
      };

      const { data, error } = await this.supabaseService.updateRecord(
        'gift_list',
        this.giftList.id,
        updateData
      );

      if (error) {
        throw error;
      }

      this.giftList = { ...this.giftList, ...data };
    } catch (error) {
      console.error('Error updating gift list:', error);
      throw error;
    }
  }

  // Calculations
  get totalItems(): number {
    return this.giftList.items.length;
  }

  get boughtItems(): number {
    return this.giftList.items.filter(item => item.bought).length;
  }

  get remainingItems(): number {
    return this.totalItems - this.boughtItems;
  }

  get completionPercentage(): number {
    return this.totalItems > 0 ? (this.boughtItems / this.totalItems) * 100 : 0;
  }

  // List name editing
  async editListName() {
    const alert = await this.alertController.create({
      header: 'Editar Nombre',
      message: 'Ingresa el nuevo nombre para tu lista de regalos:',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nombre de la lista',
          value: this.giftList.name
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: async (data) => {
            if (data.name && data.name.trim()) {
              this.giftList.name = data.name.trim();
              try {
                await this.updateGiftList();
              } catch (error) {
                console.error('Error updating list name:', error);
              }
            }
          }
        }
      ]
    });

    await alert.present();
  }

  // Store names management
  addStoreName() {
    if (this.newStoreName.trim() && !this.giftList.store_names.includes(this.newStoreName.trim())) {
      this.giftList.store_names = [...this.giftList.store_names, this.newStoreName.trim()];
      this.newStoreName = '';
      this.updateGiftList();
    }
  }

  removeStoreName(storeName: string) {
    this.giftList.store_names = this.giftList.store_names.filter(name => name !== storeName);
    this.updateGiftList();
  }

  handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addStoreName();
    }
  }

  // Item management
  openCreateItemModal() {
    this.editingItem = null;
    this.editingItemIndex = null;
    this.showItemModal = true;
  }

  openEditItemModal(item: GiftItem, index: number) {
    this.editingItem = item;
    this.editingItemIndex = index;
    this.showItemModal = true;
  }

  closeItemModal() {
    this.showItemModal = false;
    this.editingItem = null;
    this.editingItemIndex = null;
  }

  async handleItemSave(itemData: { article_code: string; article_name: string; bought: boolean }) {
    try {
      const newItem: GiftItem = {
        article_code: itemData.article_code.trim() || undefined,
        article_name: itemData.article_name.trim(),
        bought: itemData.bought
      };

      if (this.editingItemIndex !== null) {
        // Update existing item
        const updatedItems = [...this.giftList.items];
        updatedItems[this.editingItemIndex] = newItem;
        this.giftList.items = updatedItems;
      } else {
        // Add new item
        this.giftList.items = [...this.giftList.items, newItem];
      }

      // Update in Supabase
      await this.updateGiftList();

      this.closeItemModal();
    } catch (error: any) {
      console.error('Error saving item:', error);

      await this.alertCtrlService.openFestivaAlert('danger', 'Error', 'No se pudo guardar el artículo. Intenta nuevamente.', false, 'OK');
    }
  }

  async toggleItemBought(index: number) {
    try {
      const updatedItems = [...this.giftList.items];
      updatedItems[index].bought = !updatedItems[index].bought;
      this.giftList.items = updatedItems;

      // Update in Supabase
      await this.updateGiftList();
    } catch (error: any) {
      console.error('Error updating item status:', error);

      await this.alertCtrlService.openFestivaAlert('danger', 'Error', 'No se pudo actualizar el estado del artículo.', false, 'OK');
    }

  }

  // Delete management
  async confirmDeleteItem(index: number) {
    this.itemToDelete = index;
    this.showDeleteConfirm = true;

    const response = await this.alertCtrlService.openFestivaAlert('warning', '¿Eliminar artículo?', 'Esta acción no se puede deshacer. El artículo será elimnado permanentemente de la lista', true, 'Cancelar', 'Eliminar')

    if (response.action === 'confirm') {

      if (this.itemToDelete === null) return;

      try {
        const updatedItems = this.giftList.items.filter((_, index) => index !== this.itemToDelete);
        this.giftList.items = updatedItems;

        // Update in Supabase
        await this.updateGiftList();

        this.showDeleteConfirm = false;
        this.itemToDelete = null;
      } catch (error: any) {
        console.error('Error deleting item:', error);

        await this.alertCtrlService.openFestivaAlert('danger', 'Error', 'No se pudo eliminar el artículo. Intenta nuevamente.', false, 'OK');
      }
    }
    else {
      this.showDeleteConfirm = false;
      this.itemToDelete = null;
    }


  }

  // Excel import
  async handleFileSelect(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      await this.handleExcelImport(file);
    }
  }

  async handleExcelImport(file: File) {
    if (!file) return;

    // Validate file type - Accept CSV files
    const validTypes = ['text/csv', 'application/vnd.ms-excel'];

    if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.csv')) {
      await this.alertCtrlService.openFestivaAlert('danger', 'Tipo de archivo inválido', 'Por favor selecciona un archivo CSV válido.', false, 'OK');
      return;
    }

    this.isImporting = true;

    try {
      // Parse CSV file
      const csvText = await this.readFileAsText(file);

      const parseResult = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => header.trim().toLowerCase()
      });

      if (parseResult.errors.length > 0) {
        throw new Error('Error al leer el archivo CSV');
      }

      const csvData = parseResult.data as any[];

      // Validate CSV structure
      if (csvData.length === 0) {
        throw new Error('El archivo CSV está vacío');
      }

      // Check required columns
      const firstRow = csvData[0];
      if (!firstRow.hasOwnProperty('article_name')) {
        throw new Error('El archivo debe contener la columna "article_name"');
      }

      // Limit to 100 items
      if (csvData.length > 100) {
        throw new Error('El archivo no puede contener más de 100 artículos');
      }

      // Process and validate data
      const importedItems: GiftItem[] = [];
      const errors: string[] = [];

      for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i];
        const rowNumber = i + 2; // +2 because of header and 0-based index

        // Validate article_name (required)
        if (!row.article_name || !row.article_name.toString().trim()) {
          errors.push(`Fila ${rowNumber}: article_name es requerido`);
          continue;
        }

        // Validate article_name length
        const articleName = row.article_name.toString().trim();
        if (articleName.length < 3) {
          errors.push(`Fila ${rowNumber}: article_name debe tener al menos 3 caracteres`);
          continue;
        }

        // Process article_code (optional)
        const articleCode = row.article_code ? row.article_code.toString().trim() : '';

        // Process bought status (default false)
        let bought = false;
        if (row.bought !== undefined && row.bought !== null) {
          const boughtValue = row.bought.toString().trim();
          if (boughtValue === '1' || boughtValue.toLowerCase() === 'true') {
            bought = true;
          } else if (boughtValue === '0' || boughtValue.toLowerCase() === 'false') {
            bought = false;
          } else {
            errors.push(`Fila ${rowNumber}: bought debe ser 0 (false) o 1 (true)`);
            continue;
          }
        }

        // Check for duplicates in current list
        const isDuplicate = this.giftList.items.some(existingItem =>
          existingItem.article_name.toLowerCase() === articleName.toLowerCase()
        );

        if (isDuplicate) {
          errors.push(`Fila ${rowNumber}: "${articleName}" ya existe en la lista`);
          continue;
        }

        // Check for duplicates in imported items
        const isDuplicateInImport = importedItems.some(importedItem =>
          importedItem.article_name.toLowerCase() === articleName.toLowerCase()
        );

        if (isDuplicateInImport) {
          errors.push(`Fila ${rowNumber}: "${articleName}" está duplicado en el archivo`);
          continue;
        }

        // Add valid item
        importedItems.push({
          article_code: articleCode || undefined,
          article_name: articleName,
          bought: bought
        });
      }

      // Show errors if any
      if (errors.length > 0) {
        // const alert = await this.alertController.create({
        //   header: 'Errores en el archivo',
        //   message: `Se encontraron ${errors.length} errores:\n\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? '\n\n...y más errores' : ''}`,
        //   buttons: ['OK']
        // });
        // await alert.present();

        await this.alertCtrlService.openFestivaAlert('warning', 'Errores en el archivo', `Se encontraron ${errors.length} errores. Los artículos válidos serán importados.`, false, 'OK');

        // If no valid items, stop here
        if (importedItems.length === 0) {
          return;
        }
      }

      // Add imported items to existing list
      this.giftList.items = [...this.giftList.items, ...importedItems];
      // Update in Supabase
      await this.updateGiftList();

      await this.alertCtrlService.openFestivaAlert('success', 'Importación exitosa', `Se importaron ${importedItems.length} artículos exitosamente${errors.length > 0 ? ` (${errors.length} errores ignorados)` : ''}`, false, 'OK');

    } catch (error) {
      console.error('Error importing Excel:', error);

      await this.alertCtrlService.openFestivaAlert('danger', 'Error de importación', error instanceof Error ? error.message : 'Error al importar el archivo CSV. Verifica el formato.', false, 'OK');

    } finally {
      this.isImporting = false;
      // Reset file input
      if (this.fileInput) {
        this.fileInput.nativeElement.value = '';
      }
    }
  }

  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Error al leer el archivo'));
        }
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsText(file, 'UTF-8');
    });
  }

  // Export options
  toggleExportOptions() {
    this.showExportOptions = !this.showExportOptions;
  }

  closeExportOptions() {
    this.showExportOptions = false;
  }

  async handleExportPDF() {
    this.isExporting = true;
    this.showExportOptions = false;

    try {
      // Generate PDF report
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Header
      pdf.setFillColor(0, 0, 0);
      pdf.rect(0, 0, pageWidth, 40, 'F');

      // Title
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Lista de Regalos', 20, 25);

      // Event name
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text(this.eventName, 20, 35);

      // List info
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text(this.giftList.name, 20, 55);

      if (this.giftList.description) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        const splitDescription = pdf.splitTextToSize(this.giftList.description, pageWidth - 40);
        pdf.text(splitDescription, 20, 65);
      }

      // Stats
      let yPosition = this.giftList.description ? 85 : 70;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Total: ${this.totalItems} artículos | Comprados: ${this.boughtItems} | Pendientes: ${this.remainingItems}`, 20, yPosition);

      // Store names
      if (this.giftList.store_names.length > 0) {
        yPosition += 15;
        pdf.setFont('helvetica', 'bold');
        pdf.text('Tiendas sugeridas:', 20, yPosition);
        yPosition += 8;
        pdf.setFont('helvetica', 'normal');
        pdf.text(this.giftList.store_names.join(', '), 20, yPosition);
      }

      // Items table
      yPosition += 20;

      // Table header
      pdf.setFillColor(240, 240, 240);
      pdf.rect(20, yPosition - 5, pageWidth - 40, 12, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.text('Estado', 25, yPosition + 3);
      pdf.text('Código', 55, yPosition + 3);
      pdf.text('Artículo', 95, yPosition + 3);

      yPosition += 15;

      // Items
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);

      for (let i = 0; i < this.giftList.items.length; i++) {
        const item = this.giftList.items[i];

        // Check if we need a new page
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }

        // Status
        pdf.setTextColor(item.bought ? 34 : 234, item.bought ? 197 : 88, item.bought ? 94 : 12);
        pdf.text(item.bought ? ' Comprado' : ' Pendiente', 25, yPosition);

        // Code
        pdf.setTextColor(0, 0, 0);
        pdf.text(item.article_code || '-', 55, yPosition);

        // Name (with text wrapping)
        const splitName = pdf.splitTextToSize(item.article_name, pageWidth - 115);
        pdf.text(splitName, 95, yPosition);

        yPosition += Math.max(8, splitName.length * 5);
      }

      // Footer
      const footerY = pageHeight - 15;
      pdf.setTextColor(128, 128, 128);
      pdf.setFontSize(8);
      pdf.text(`Generado el ${new Date().toLocaleDateString('es-ES')} - Festiva`, 20, footerY);

      // Save PDF
      pdf.save(`${this.giftList.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
      

      await this.alertCtrlService.openFestivaAlert('success', 'Exportación exitosa', 'Lista exportada como PDF exitosamente', false, 'OK');
    } catch (error) {
      console.error('Error exporting PDF:', error);

      this.alertCtrlService.openFestivaAlert('danger', 'Error', 'No se pudo exportar la lista como PDF. Intenta nuevamente.', false, 'OK');
    } finally {
      this.isExporting = false;
    }
  }

  async handleExportPNG() {
    this.isExporting = true;
    this.showExportOptions = false;

    try {
      // Create a temporary HTML element for the report
      const reportElement = document.createElement('div');
      reportElement.style.cssText = `
        width: 800px;
        padding: 40px;
        background: white;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        position: absolute;
        top: -9999px;
        left: -9999px;
      `;

      reportElement.innerHTML = `
        <!-- Header -->
        <div style="background: black; color: white; padding: 30px; border-radius: 20px; margin-bottom: 30px;">
          <h1 style="font-size: 32px; font-weight: bold; margin: 0 0 10px 0;">Lista de Regalos</h1>
          <p style="font-size: 18px; margin: 0; opacity: 0.8;">${this.eventName}</p>
        </div>
        
        <!-- List Info -->
        <div style="background: #f8fafc; padding: 25px; border-radius: 15px; margin-bottom: 25px;">
          <h2 style="font-size: 24px; font-weight: bold; margin: 0 0 15px 0; color: #1f2937;">${this.giftList.name}</h2>
          ${this.giftList.description ? `<p style="color: #6b7280; margin: 0 0 15px 0; line-height: 1.6;">${this.giftList.description}</p>` : ''}
          <div style="display: flex; gap: 20px; margin-bottom: 15px;">
            <span style="background: #dbeafe; color: #1d4ed8; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 14px;">Total: ${this.totalItems}</span>
            <span style="background: #dcfce7; color: #166534; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 14px;">Comprados: ${this.boughtItems}</span>
            <span style="background: #fed7aa; color: #c2410c; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 14px;">Pendientes: ${this.remainingItems}</span>
          </div>
          ${this.giftList.store_names.length > 0 ? `
            <div>
              <p style="font-weight: 600; color: #374151; margin: 0 0 8px 0; font-size: 14px;">Tiendas sugeridas:</p>
              <p style="color: #6366f1; margin: 0; font-size: 14px;">${this.giftList.store_names.join(', ')}</p>
            </div>
          ` : ''}
        </div>
        
        <!-- Items List -->
        <div style="background: white; border: 2px solid #e5e7eb; border-radius: 15px; overflow: hidden;">
          <!-- Table Header -->
          <div style="background: #f3f4f6; padding: 15px 20px; border-bottom: 1px solid #e5e7eb;">
            <div style="display: grid; grid-template-columns: 100px 120px 1fr; gap: 20px; font-weight: bold; color: #374151; font-size: 14px;">
              <span>Estado</span>
              <span>Código</span>
              <span>Artículo</span>
            </div>
          </div>
          
          <!-- Items -->
          ${this.giftList.items.map((item, index) => `
            <div style="padding: 15px 20px; border-bottom: ${index < this.giftList.items.length - 1 ? '1px solid #f3f4f6' : 'none'}; ${item.bought ? 'background: #f0fdf4;' : ''}">
              <div style="display: grid; grid-template-columns: 100px 120px 1fr; gap: 20px; align-items: center;">
                <span style="
                  padding: 6px 12px; 
                  border-radius: 20px; 
                  font-size: 12px; 
                  font-weight: 600;
                  ${item.bought
          ? 'background: #dcfce7; color: #166534;'
          : 'background: #fed7aa; color: #c2410c;'
        }
                ">
                  ${item.bought ? '✓ Comprado' : '○ Pendiente'}
                </span>
                <span style="color: #6b7280; font-size: 14px;">${item.article_code || '-'}</span>
                <span style="color: #1f2937; font-weight: 500; font-size: 16px; ${item.bought ? 'text-decoration: line-through; opacity: 0.7;' : ''}">${item.article_name}</span>
              </div>
            </div>
          `).join('')}
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            Generado el ${new Date().toLocaleDateString('es-ES')} - Festiva
          </p>
        </div>
      `;

      document.body.appendChild(reportElement);

      // Generate canvas from HTML
      const canvas = await html2canvas(reportElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      // Remove temporary element
      document.body.removeChild(reportElement);

      // Create download link
      const link = document.createElement('a');
      link.download = `${this.giftList.name.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      await this.alertCtrlService.openFestivaAlert('success', 'Exportación exitosa', 'Lista exportada como imagen PNG exitosamente', false, 'OK');
    } catch (error) {
      console.error('Error exporting PNG:', error);

      await this.alertCtrlService.openFestivaAlert('danger', 'Error', 'No se pudo exportar la lista como imagen. Intenta nuevamente.', false, 'OK');

    } finally {
      this.isExporting = false;
    }
  }

  // Navigation
  goBack() {
    this.router.navigate(['/events/management'], { state: { event: this.event }, replaceUrl: true });

  }

  // Helper for template
  trackByIndex(index: number): number {
    return index;
  }

  async handleExportPDF2() {
    this.isExporting = true;
    this.showExportOptions = false;

    try {
      // Generate HTML content for the report
      const htmlContent = this.generateReportHTML();

      // Check if running on mobile device
      const deviceInfo = await Device.getInfo();
      const isNative = Capacitor.isNativePlatform();

      if (isNative) {
        // For mobile devices, save as HTML file and share
        const fileName = `${this.giftList.name.replace(/[^a-zA-Z0-9]/g, '_')}_lista_regalos.html`;

        await Filesystem.writeFile({
          path: fileName,
          data: htmlContent,
          directory: Directory.Cache,
          encoding: Encoding.UTF8
        });

        const fileUri = await Filesystem.getUri({
          directory: Directory.Cache,
          path: fileName
        });

        await Share.share({
          title: 'Lista de Regalos',
          text: `Lista de regalos para ${this.eventName}`,
          url: fileUri.uri,
          dialogTitle: 'Compartir Lista de Regalos'
        });
      } else {
        // For web, create downloadable HTML file
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.giftList.name.replace(/[^a-zA-Z0-9]/g, '_')}_lista_regalos.html`;
        link.click();
        URL.revokeObjectURL(url);
      }

        await this.alertCtrlService.openFestivaAlert('success', 'Exportación exitosa', 'Lista exportada como PDF exitosamente', false, 'OK');

    } catch (error) {
      console.error('Error exporting PDF:', error);

      await this.alertCtrlService.openFestivaAlert('danger', 'Error', 'No se pudo exportar la lista como PDF. Intenta nuevamente.', false, 'OK');
    } finally {
      this.isExporting = false;
    }
  }

  async handleExportPNG2() {
    this.isExporting = true;
    this.showExportOptions = false;

    try {
      // Generate CSV content for sharing
      const csvContent = this.generateCSVContent();

      // Check if running on mobile device
      const isNative = Capacitor.isNativePlatform();

      if (isNative) {
        // For mobile devices, save as CSV file and share
        const fileName = `${this.giftList.name.replace(/[^a-zA-Z0-9]/g, '_')}_lista_regalos.csv`;

        await Filesystem.writeFile({
          path: fileName,
          data: csvContent,
          directory: Directory.Cache,
          encoding: Encoding.UTF8
        });

        const fileUri = await Filesystem.getUri({
          directory: Directory.Cache,
          path: fileName
        });

        await Share.share({
          title: 'Lista de Regalos',
          text: `Lista de regalos para ${this.eventName}`,
          url: fileUri.uri,
          dialogTitle: 'Compartir Lista de Regalos'
        });
      } else {
        // For web, create downloadable CSV file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.giftList.name.replace(/[^a-zA-Z0-9]/g, '_')}_lista_regalos.csv`;
        link.click();
        URL.revokeObjectURL(url);
      }

      await this.alertCtrlService.openFestivaAlert('success', 'Exportación exitosa', 'Lista exportada como imagen PNG exitosamente', false, 'OK');
    } catch (error) {
      console.error('Error exporting PNG:', error);
      await this.alertCtrlService.openFestivaAlert('danger', 'Error', 'No se pudo exportar la lista como imagen. Intenta nuevamente.', false, 'OK');
    } finally {
      this.isExporting = false;
    }
  }



  private generateReportHTML(): string {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Lista de Regalos - ${this.giftList.name}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            margin: 0;
            padding: 40px;
            background: #f8fafc;
            color: #1f2937;
          }
          .header {
            background: linear-gradient(135deg, #1f2937, #374151);
            color: white;
            padding: 30px;
            border-radius: 20px;
            margin-bottom: 30px;
            text-align: center;
          }
          .header h1 {
            font-size: 32px;
            font-weight: bold;
            margin: 0 0 10px 0;
          }
          .header p {
            font-size: 18px;
            margin: 0;
            opacity: 0.8;
          }
          .info-section {
            background: white;
            padding: 25px;
            border-radius: 15px;
            margin-bottom: 25px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .stats {
            display: flex;
            gap: 15px;
            margin: 15px 0;
            flex-wrap: wrap;
          }
          .stat-badge {
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 14px;
          }
          .stat-total { background: #dbeafe; color: #1d4ed8; }
          .stat-bought { background: #dcfce7; color: #166534; }
          .stat-pending { background: #fed7aa; color: #c2410c; }
          .items-table {
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .table-header {
            background: #f3f4f6;
            padding: 15px 20px;
            border-bottom: 1px solid #e5e7eb;
            display: grid;
            grid-template-columns: 120px 150px 1fr;
            gap: 20px;
            font-weight: bold;
            color: #374151;
            font-size: 14px;
          }
          .table-row {
            padding: 15px 20px;
            border-bottom: 1px solid #f3f4f6;
            display: grid;
            grid-template-columns: 120px 150px 1fr;
            gap: 20px;
            align-items: center;
          }
          .table-row:last-child {
            border-bottom: none;
          }
          .table-row.bought {
            background: #f0fdf4;
          }
          .status-badge {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-align: center;
          }
          .status-bought {
            background: #dcfce7;
            color: #166534;
          }
          .status-pending {
            background: #fed7aa;
            color: #c2410c;
          }
          .item-name {
            font-weight: 500;
            font-size: 16px;
          }
          .item-name.bought {
            text-decoration: line-through;
            opacity: 0.7;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #9ca3af;
            font-size: 12px;
          }
          @media print {
            body { background: white; }
            .header { background: #1f2937 !important; }
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div class="header">
          <h1>Lista de Regalos</h1>
          <p>${this.eventName}</p>
        </div>
        
        <!-- List Info -->
        <div class="info-section">
          <h2 style="font-size: 24px; font-weight: bold; margin: 0 0 15px 0;">${this.giftList.name}</h2>
          ${this.giftList.description ? `<p style="color: #6b7280; margin: 0 0 15px 0; line-height: 1.6;">${this.giftList.description}</p>` : ''}
          <div class="stats">
            <span class="stat-badge stat-total">Total: ${this.totalItems}</span>
            <span class="stat-badge stat-bought">Comprados: ${this.boughtItems}</span>
            <span class="stat-badge stat-pending">Pendientes: ${this.remainingItems}</span>
          </div>
          ${this.giftList.store_names.length > 0 ? `
            <div>
              <p style="font-weight: 600; color: #374151; margin: 15px 0 8px 0; font-size: 14px;">Tiendas sugeridas:</p>
              <p style="color: #6366f1; margin: 0; font-size: 14px;">${this.giftList.store_names.join(', ')}</p>
            </div>
          ` : ''}
        </div>
        
        <!-- Items Table -->
        <div class="items-table">
          <div class="table-header">
            <span>Estado</span>
            <span>Código</span>
            <span>Artículo</span>
          </div>
          ${this.giftList.items.map(item => `
            <div class="table-row ${item.bought ? 'bought' : ''}">
              <span class="status-badge ${item.bought ? 'status-bought' : 'status-pending'}">
                ${item.bought ? '✓ Comprado' : '○ Pendiente'}
              </span>
              <span style="color: #6b7280; font-size: 14px;">${item.article_code || '-'}</span>
              <span class="item-name ${item.bought ? 'bought' : ''}">${item.article_name}</span>
            </div>
          `).join('')}
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <p>Generado el ${new Date().toLocaleDateString('es-ES')} - Festiva</p>
        </div>
      </body>
      </html>
    `;
  }

  private generateCSVContent(): string {
    const headers = ['Estado', 'Código', 'Artículo'];
    const rows = this.giftList.items.map(item => [
      item.bought ? 'Comprado' : 'Pendiente',
      item.article_code || '-',
      item.article_name
    ]);

    const csvContent = [
      `# Lista de Regalos: ${this.giftList.name}`,
      `# Evento: ${this.eventName}`,
      `# Generado: ${new Date().toLocaleDateString('es-ES')}`,
      `# Total: ${this.totalItems} | Comprados: ${this.boughtItems} | Pendientes: ${this.remainingItems}`,
      '',
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }
}