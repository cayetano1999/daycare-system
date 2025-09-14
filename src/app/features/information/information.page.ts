import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { StandAloneModules } from '../../shared/stand-alone-module';

@Component({
  selector: 'app-app-info',
  templateUrl: './information.page.html',
  styleUrls: ['./information.page.scss'],
  imports: [...StandAloneModules]
})
export class InformationPage implements OnInit {
  
  private router = inject(Router);
  private navCtrl = inject(NavController);

  // Animation states
  isLoading: boolean = false;
  showAnimations: boolean = false;

  // Contact information
  contactPhone: string = '1809-371-6874';
  
  // App statistics (could be dynamic in the future)
  appStats = {
    eventsCreated: '10,000+',
    happyClients: '5,000+',
    professionalPlanners: '500+',
    countriesServed: '15+'
  };

  // Features list
  features = [
    {
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      title: 'Gestión Inteligente de Invitados',
      description: 'Administra tu lista de invitados con filtros avanzados, estadísticas en tiempo real y seguimiento de confirmaciones.',
      color: 'purple'
    },
    {
      icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a1 1 0 001 1h1a1 1 0 001-1V7a2 2 0 00-2-2H5zM5 21a2 2 0 01-2-2v-3a1 1 0 011-1h1a1 1 0 011 1v3a2 2 0 01-2 2H5zM19 5a2 2 0 012 2v3a1 1 0 01-1 1h-1a1 1 0 01-1-1V7a2 2 0 012-2h1zM19 21a2 2 0 002-2v-3a1 1 0 00-1-1h-1a1 1 0 00-1 1v3a2 2 0 002 2h1z',
      title: 'Invitaciones Digitales Premium',
      description: 'Crea invitaciones elegantes con códigos QR únicos, diseños personalizables y seguimiento de visualizaciones.',
      color: 'blue'
    },
    {
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
      title: 'Organización de Mesas Inteligente',
      description: 'Optimiza la distribución de invitados con nuestro sistema de asignación automática y control de capacidad.',
      color: 'green'
    },
    {
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      title: 'Análisis y Reportes Avanzados',
      description: 'Obtén insights detallados sobre tu evento con reportes en tiempo real y métricas de participación.',
      color: 'orange'
    }
  ];

  // Professional benefits
  professionalBenefits = [
    'Herramientas profesionales de última generación',
    'Acceso a una red de clientes premium',
    'Soporte técnico especializado 24/7',
    'Capacitación continua y certificaciones',
    'Comisiones competitivas por evento',
    'Dashboard personalizado para planificadores',
    'Integración con proveedores de servicios',
    'Marketing y promoción de tu perfil profesional'
  ];

  constructor() {}

  ngOnInit() {
    // Trigger animations after component loads
    setTimeout(() => {
      this.showAnimations = true;
    }, 300);
  }

  ionViewWillEnter() {
    // Reset animations when entering the page
    this.showAnimations = false;
    setTimeout(() => {
      this.showAnimations = true;
    }, 100);
  }

  goBack() {
    this.navCtrl.back();
  }

  // Contact methods
  callPhone() {
    if (this.contactPhone) {
      window.open(`tel:${this.contactPhone}`, '_system');
    }
  }

  copyPhone() {
    if (navigator.clipboard && this.contactPhone) {
      navigator.clipboard.writeText(this.contactPhone).then(() => {
        this.showToast('Número copiado al portapapeles', 'success');
      }).catch(() => {
        this.showToast('Error al copiar número', 'error');
      });
    }
  }

  // Share app information
  shareApp() {
    if (navigator.share) {
      navigator.share({
        title: 'Festiva - Gestión Profesional de Eventos',
        text: 'Descubre la plataforma líder en gestión de eventos y celebraciones especiales',
        url: window.location.origin
      }).catch(console.error);
    } else {
      // Fallback for browsers that don't support Web Share API
      this.copyToClipboard(window.location.origin);
      this.showToast('Enlace copiado al portapapeles', 'success');
    }
  }

  // Utility methods
  private copyToClipboard(text: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }

  private showToast(message: string, type: 'success' | 'error' | 'warning' = 'success') {
    // TODO: Implement toast notification
  }

  // Feature interaction methods
  onFeatureClick(feature: any) {
    // TODO: Navigate to specific feature demo or more info
  }

  // Professional contact methods
  contactForProfessionals() {
    const message = encodeURIComponent(
      'Hola, soy un planificador profesional de eventos y me interesa formar parte del equipo de administradores de Festiva. Me gustaría obtener más información sobre las oportunidades disponibles.'
    );
    
    // Try WhatsApp first, then fallback to SMS, then phone call
    const whatsappUrl = `https://wa.me/18093716874?text=${message}`;
    const smsUrl = `sms:${this.contactPhone}?body=${message}`;
    
    // Check if WhatsApp is available (mobile devices)
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      window.open(whatsappUrl, '_system');
    } else {
      // Desktop: try SMS, then phone
      try {
        window.open(smsUrl, '_system');
      } catch {
        this.callPhone();
      }
    }
  }

  // Analytics methods (for future implementation)
  trackFeatureView(featureName: string) {
    // TODO: Implement analytics tracking
  }

  trackContactAttempt(method: string) {
    // TODO: Implement analytics tracking
  }

  // Animation helpers
  getFeatureColorClasses(color: string): string {
    const colorMap: { [key: string]: string } = {
      purple: 'from-purple-50 to-purple-100 border-purple-200',
      blue: 'from-blue-50 to-blue-100 border-blue-200',
      green: 'from-green-50 to-green-100 border-green-200',
      orange: 'from-orange-50 to-orange-100 border-orange-200'
    };
    return colorMap[color] || colorMap['purple'];
  }

  getFeatureIconColorClasses(color: string): string {
    const colorMap: { [key: string]: string } = {
      purple: 'bg-purple-600',
      blue: 'bg-blue-600',
      green: 'bg-green-600',
      orange: 'bg-orange-600'
    };
    return colorMap[color] || colorMap['purple'];
  }

  // Scroll to section (for future navigation implementation)
  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}