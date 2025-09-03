import { Component, OnInit, ViewChild, ElementRef, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { StorageKeys } from 'src/app/core/enums/storage.keys.enum';
import { StorageHelper } from 'src/app/core/helpers/storage.helper';
import { FestivaEvent } from 'src/app/core/interface/event.interface';
import { Profile } from 'src/app/core/interface/profile.interface';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { FestivaHeaderComponent } from 'src/app/shared/components/festiva-header/festiva-header.component';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';

interface FormData {
  id: string;
  plan_type: 'Starter' | 'Essential' | 'Premium' | 'Elite' | '';
  event_date: string;
  event_time: string;
  name: string;
  description: string;
  share_text: string;
  url_media: string;
  image: string;
  user_id: string;
  location: string;
}

interface Plan {
  type: 'Starter' | 'Essential' | 'Premium' | 'Elite';
  name: string;
  description: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  features: string[];
}

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.page.html',
  styleUrls: ['./create-event.page.scss'],
  imports: [...StandAloneModules, FestivaHeaderComponent]
})
export class CreateEventPage implements OnInit {
  @Input() editingEvent?: boolean; // For future editing functionality
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  formData: FormData = {
    id: '',
    plan_type: '',
    event_date: '',
    event_time: '',
    name: '',
    description: '',
    share_text: '',
    url_media: '',
    image: '',
    user_id: '',
    location: ''
  };

  isLoading = false;
  errors: Record<string, string> = {};
  imagePreview = '';
  isDragOver = false;
  minDate = '';
  showSuccess = false;
  createdEvent: any = null;

  plans: Plan[] = [
    {
      type: 'Starter',
      name: 'Starter',
      description: 'Perfecto para eventos pequeños',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
      features: ['Hasta 50 invitados', 'Plantillas básicas', 'Soporte email']
    },
    {
      type: 'Essential',
      name: 'Essential',
      description: 'Ideal para celebraciones familiares',
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      features: ['Hasta 150 invitados', 'Plantillas premium', 'Lista de regalos']
    },
    {
      type: 'Premium',
      name: 'Premium',
      description: 'Para eventos especiales importantes',
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200',
      features: ['Hasta 300 invitados', 'Diseños exclusivos', 'Analytics avanzado']
    },
    {
      type: 'Elite',
      name: 'Elite',
      description: 'La experiencia más completa',
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200',
      features: ['Invitados ilimitados', 'Soporte prioritario', 'Personalización total']
    }
  ];
  user!: Profile;

  private alertController = inject(AlertController);
  private navController = inject(NavController);
  private supabaseService = inject(SupabaseService);
  private storageHelper = inject(StorageHelper);
  private router = inject(Router);

  constructor(

  ) {
    
  }

  populateFormForEditing(event: FestivaEvent | FormData | any) {
    this.formData = {
      id: event.id,
      user_id: event.user_id,
      plan_type: event.plan_type,
      event_date: event.event_date ? new Date(event.event_date).toISOString().split('T')[0] : '',
      event_time: event.event_date ? new Date(event.event_date).toISOString().slice(11, 16) : '',
      name: event.name,
      description: event.description,
      share_text: event.share_text,
      url_media: event.url_media,
      image: event.image,
      location: event.location
    };
    this.imagePreview = event.image;
  }

  ngOnInit() {
    // Set minimum date to today
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  async ionViewWillEnter() {
    this.user = await this.storageHelper.getStorageKey<Profile>(StorageKeys.USER_DATA) as Profile;
    const navigation = this.router.getCurrentNavigation();
    console.log(navigation);
    if (navigation && navigation.extras && navigation.extras.state) {
      const event = navigation.extras.state['event'];

      if(event) {
        this.populateFormForEditing(event);
        this.editingEvent = true;
      }
    }
  }

  selectPlan(planType: 'Starter' | 'Essential' | 'Premium' | 'Elite') {
    this.formData.plan_type = planType;
    if (this.errors['plan_type']) {
      delete this.errors['plan_type'];
    }
  }

  validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    if (!this.formData.plan_type) {
      newErrors['plan_type'] = 'Selecciona un plan';
    }

    if (!this.formData.event_date) {
      newErrors['event_date'] = 'Selecciona la fecha del evento';
    }

    if (!this.formData.event_time) {
      newErrors['event_time'] = 'Selecciona la hora del evento';
    }

    if (!this.formData.name.trim()) {
      newErrors['name'] = 'El nombre del evento es requerido';
    } else if (this.formData.name.length < 3) {
      newErrors['name'] = 'El nombre debe tener al menos 3 caracteres';
    } else if (this.formData.name.length > 50) {
      newErrors['name'] = 'El nombre no puede exceder 50 caracteres';
    }

    if (!this.formData.description.trim()) {
      newErrors['description'] = 'La descripción del evento es requerida';
    } else if (this.formData.description.length < 10) {
      newErrors['description'] = 'La descripción debe tener al menos 10 caracteres';
    } else if (this.formData.description.length > 100) {
      newErrors['description'] = 'La descripción no puede exceder 100 caracteres';
    }

    if (!this.formData.share_text.trim()) {
      newErrors['share_text'] = 'El texto para compartir es requerido';
    }

    if (!this.formData.image) {
      newErrors['image'] = 'Selecciona una imagen para el evento';
    }

    this.errors = newErrors;
    return Object.keys(newErrors).length === 0;
  }

  scrollToError(errors: Record<string, string>) {
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField) {
      const fieldSelectors: Record<string, string> = {
        plan_type: '[data-field="plan_type"]',
        event_date: '[data-field="event_date"]',
        event_time: '[data-field="event_time"]',
        name: '[data-field="name"]',
        description: '[data-field="description"]',
        share_text: '[data-field="share_text"]',
        image: '[data-field="image"]'
      };

      const selector = fieldSelectors[firstErrorField];
      if (selector) {
        const element = document.querySelector(selector);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });

          // Add shake animation
          element.classList.add('animate-shake');
          setTimeout(() => {
            element.classList.remove('animate-shake');
          }, 600);
        }
      }
    }
  }

  compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (max 800px width/height)
        let { width, height } = img;
        const maxSize = 800;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(compressedDataUrl);
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  async handleImageSelect(file: File) {
    if (!file) return;

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      this.errors['image'] = 'Solo se permiten archivos PNG, JPEG y JPG';
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.errors['image'] = 'La imagen no puede ser mayor a 5MB';
      return;
    }

    try {
      const compressedImage = await this.compressImage(file);
      this.formData.image = compressedImage;
      this.imagePreview = compressedImage;
      delete this.errors['image'];
    } catch (error) {
      this.errors['image'] = 'Error al procesar la imagen';
    }
  }

  handleFileSelect(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.handleImageSelect(file);
    }
  }

  handleDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    const file = event.dataTransfer?.files[0];
    if (file) {
      this.handleImageSelect(file);
    }
  }

  handleDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  handleDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  removeImage() {
    this.imagePreview = '';
    this.formData.image = '';
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  async onSubmit() {
    if (!this.validateForm()) {
      this.scrollToError(this.errors);
      return;
    }

    this.isLoading = true;

    try {
      // Combine date and time into timestamp
      const eventDateTime = new Date(`${this.formData.event_date}T${this.formData.event_time}`);

      const eventData = {
        id: this.formData.id,
        plan_type: this.formData.plan_type,
        event_date: eventDateTime.toISOString(),
        status: 'DRAFT', // Default status for new events
        name: this.formData.name.trim(),
        description: this.formData.description.trim(),
        image: this.formData.image,
        share_text: this.formData.share_text.trim(),
        url_media: this.formData.url_media || null,
        user_id: this.editingEvent ? this.formData.user_id : this.user.id,
        location: this.formData.location.trim()
      } as any;

      // Save to Supabase
      let data, error;
      if (this.editingEvent) {
        const response = await this.supabaseService.updateRecord('events', eventData.id, eventData);
        data = response.data;
        error = response.error;
      } else {
        delete eventData.id; // Remove id for new records
        const response = await this.supabaseService.createRecord('events', eventData);
        data = response.data;
        error = response.error;
      }

      if (error) {
        throw error;
      }

      // Show success screen
      this.createdEvent = data;
      this.showSuccess = true;

    } catch (error: any) {
      console.error('Error creating event:', error);

      let errorMessage = 'Hubo un problema al crear tu evento. Por favor, intenta nuevamente.';

      if (error.message?.includes('duplicate')) {
        errorMessage = 'Ya existe un evento con este nombre.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente.';
      }

      const alert = await this.alertController.create({
        header: 'Error al crear evento',
        message: errorMessage,
        buttons: ['OK']
      });
      await alert.present();
    } finally {
      this.isLoading = false;
    }
  }

  onContinueFromSuccess() {
    this.showSuccess = false;
    this.navController.back();
  }

  goBack() {
    this.navController.back();
  }

  formatEventDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getPlanTypeColor(planType: string): string {
    switch (planType) {
      case 'Starter':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Essential':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Premium':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Elite':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  // Helper for template
  Math = Math;
}