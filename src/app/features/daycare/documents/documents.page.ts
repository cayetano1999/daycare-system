import { Component, inject, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { AlertControllerService } from 'src/app/core/services/ionic/alert-controller.service';

import { SupabaseStorageService } from 'src/app/core/services/supabase-storage.service';
import { SafeHtmlPipe } from 'src/app/shared/pipes/safe-html.pipe';
import { PipesModule } from "../../../shared/pipes/pipes.module";
import { StandAloneModules } from 'src/app/shared/stand-alone-module';
import { CustomHeaderComponent } from 'src/app/shared/daycare/custom-header/custom-header.component';

interface Child {
  id: string;
  full_name: string;
  ciclo: string | null;
  registration_id?: string;
}

interface Documents {
  id: string;
  registration_id: string;
  birth_certificate: string | null;
  legal_parents_identification: string | null;
  medical_certificate: string | null;
  vaccination_card: string | null;
  picture_5x2: string | null;
  health_insurance: string | null;
  pickuper_identification: string | null;
  created_at: string;
}

@Component({
  selector: 'app-documents-page',
  templateUrl: './documents.page.html',
  styleUrls: ['./documents.page.scss'],
  standalone: true,
  imports: [...StandAloneModules, CustomHeaderComponent],
  providers: [SafeHtmlPipe]
})
export class DocumentsPage implements OnInit, OnDestroy {
  supabaseService = inject(SupabaseService);
  supabaseStorageService = inject(SupabaseStorageService);
  alertService = inject(AlertControllerService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  location = inject(Location);
  sanitizer = inject(DomSanitizer);

  allChildren: Child[] = [];
  filteredChildren: Child[] = [];
  selectedChild: Child | null = null;
  documents: Documents | null = null;

  searchTerm: string = '';
  showDropdown: boolean = false;
  loading: boolean = false;

  showViewer: boolean = false;
  viewerUrl: SafeResourceUrl | null = null;
  viewerTitle: string = '';
  originalUrl: string = '';

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const searchContainer = document.querySelector('.search-container');

    if (searchContainer && !searchContainer.contains(target)) {
      this.showDropdown = false;
    }
  }

  constructor() {

  }

  async ngOnInit() {
    await this.loadChildren();

    this.route.params.subscribe(async params => {
      if (params['id']) {
        await this.loadDocumentsByRegistrationId(params['id']);
      }
    });
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  async loadChildren() {
    try {
      const supabase = this.supabaseService.getSupabase();
      const { data, error } = await supabase
        .from('children')
        .select(`
          id,
          full_name,
          ciclo,
          registration!inner(id)
        `)
        .order('full_name');

      if (error) throw error;

      this.allChildren = (data || []).map((child: any) => ({
        id: child.id,
        full_name: child.full_name,
        ciclo: child.ciclo,
        registration_id: child.registration?.[0]?.id
      }));

      this.filteredChildren = [...this.allChildren];
    } catch (error) {
      console.error('Error loading children:', error);
      await this.alertService.openFestivaAlert(
        'danger',
        'Error',
        'No se pudieron cargar los niños'
      );
    }
  }

  filterChildren() {
    if (!this.searchTerm.trim()) {
      this.filteredChildren = [...this.allChildren];
    } else {
      this.filteredChildren = this.allChildren.filter(child =>
        child.full_name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    this.showDropdown = true;
  }

  async selectChild(child: Child) {
    this.selectedChild = child;
    this.searchTerm = child.full_name;
    this.showDropdown = false;

    if (child.registration_id) {
      await this.loadDocumentsByRegistrationId(child.registration_id);
    } else {
      this.documents = null;
      await this.alertService.openFestivaAlert(
        'warning',
        'Sin inscripción',
        'Este niño no tiene una inscripción registrada'
      );
    }
  }

  clearSelection() {
    this.selectedChild = null;
    this.documents = null;
    this.searchTerm = '';
    this.filteredChildren = [...this.allChildren];
  }

  async loadDocumentsByRegistrationId(registrationId: string) {
    this.loading = true;
    try {
      const supabase = this.supabaseService.getSupabase();

      const { data: registration, error: regError } = await supabase
        .from('registration')
        .select('children_id, children(id, full_name, ciclo)')
        .eq('id', registrationId)
        .maybeSingle();

      if (regError) throw regError;

      if (registration) {
        const child = registration.children as any;
        if (!this.selectedChild) {
          this.selectedChild = {
            id: child.id,
            full_name: child.full_name,
            ciclo: child.ciclo,
            registration_id: registrationId
          };
          this.searchTerm = child.full_name;
        }
      }

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('registration_id', registrationId)
        .maybeSingle();

      if (error) throw error;

      this.documents = data;
      await this.completeSupabaseURlForDocuments();

      if (!data) {
        await this.alertService.openFestivaAlert(
          'warning',
          'Sin documentos',
          'No hay documentos disponibles para esta inscripción'
        );
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      await this.alertService.openFestivaAlert(
        'danger',
        'Error',
        'No se pudieron cargar los documentos'
      );
    } finally {
      this.loading = false;
    }
  }

  getPublicUrl(path: string): string {
    if (!path) return '';
    const supabase = this.supabaseService.getSupabase();
    const { data } = supabase.storage.from('babyhouse').getPublicUrl(path);
    return data.publicUrl;
  }

  getPdfUrl(path: string): SafeResourceUrl {
    const url = this.getPublicUrl(path);
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  isImage(path: string): boolean {
    if (!path) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return imageExtensions.some(ext => path.toLowerCase().includes(ext));
  }

  isPdf(path: string): boolean {
    if (!path) return false;
    return path.toLowerCase().includes('.pdf');
  }

  viewDocument(path: string, title: string) {
    this.viewerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(path);
    this.originalUrl = path;
    this.viewerTitle = title;
    this.showViewer = true;
  }

  closeViewer() {
    this.showViewer = false;
    this.viewerUrl = null;
    this.originalUrl = '';
    this.viewerTitle = '';
  }

  async downloadDocument(path: string, filename: string) {
    try {
      const exten = path?.split("?")[0].split('/').pop()?.split('.').pop();
      const fullFilename = `${filename}_${this.selectedChild?.full_name.replace(/\s+/g, '_')}.${exten}`;

      const response = await fetch(path);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fullFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      await this.alertService.openFestivaAlert(
        'success',
        'Descarga exitosa',
        `El documento se ha descargado correctamente`
      );
    } catch (error) {
      console.error('Error downloading document:', error);
      await this.alertService.openFestivaAlert(
        'danger',
        'Error',
        'No se pudo descargar el documento'
      );
    }
  }

  getInitial(name: string): string {
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  goBack() {
    this.location.back();
  }

  countDocuments(): number {
    if (!this.documents) return 0;

    let count = 0;
    const docKeys: (keyof Documents)[] = [
      'birth_certificate',
      'legal_parents_identification',
      'medical_certificate',
      'vaccination_card',
      'picture_5x2',
      'health_insurance',
      'pickuper_identification'
    ];

    docKeys.forEach(key => {
      if (this.documents![key]) count++;
    });

    return count;
  }

  async completeSupabaseURlForDocuments() {
    if (!this.documents) return;

    const docKeys = Object.keys(this.documents).filter(
      key =>
        !['id', 'registration_id', 'created_at'].includes(key) &&
        this.documents![key as keyof Documents]
    );

    for (const key of docKeys) {
      const path = this.documents![key as keyof Documents] as string | null;
      if (path) {
        const signedUrl = await this.supabaseStorageService.getSignedUrl(path);
        this.documents![key as keyof Documents] = signedUrl;
      }
    }

    console.log('Documents with signed URLs:', this.documents);
  }
}
