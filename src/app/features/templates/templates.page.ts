import { Component, inject, OnInit } from '@angular/core';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';
import { ExampleInvitation } from '../dashboard/dashboard.page';
import { remoteConfig } from 'src/environments/environment.remoteconfig';
import { ModalController, NavController } from '@ionic/angular';
import { ModalGifTemplateComponent } from 'src/app/shared/components/modal-gif-template/modal-gif-template.component';


@Component({
  selector: 'app-templates',
  templateUrl: './templates.page.html',
  styleUrls: ['./templates.page.scss'],
  standalone: true,
  imports: [...StandAloneModules]
})
export class TemplatesPage implements OnInit {
  
  // Datos de invitaciones
  invitaciones: ExampleInvitation[] = remoteConfig.TICKET_TEMPLATES;
 // Invitaciones agrupadas por tipo
  invitacionesAgrupadas: { [key: string]: ExampleInvitation[] } = {};
  
  // Invitaciones agrupadas y ordenadas (Boda primero)
  invitacionesAgrupadasOrdenadas: { key: string, value: ExampleInvitation[] }[] = [];

  private readonly modalCtrl = inject(ModalController);
  private readonly navCtrl = inject(NavController);

  constructor() { }

  ngOnInit() {
    this.agruparInvitaciones();
    this.ordenarGrupos();
  }

  back() {
    this.navCtrl.back();
  }

  /**
   * Muestra el modal con la imagen seleccionada
   * @param imgUrl - La URL de la imagen a mostrar
   */
  async showModal(imgUrl: string) {
    const modal = await this.modalCtrl.create({
      component: ModalGifTemplateComponent,
      componentProps: { imgUrl },

    });

    await modal.present();
  }

  /**
   * Agrupa las invitaciones por tipo
   */
  private agruparInvitaciones(): void {
    this.invitacionesAgrupadas = this.invitaciones.reduce((acc, invitacion) => {
      const tipo = invitacion.type;
      if (!acc[tipo]) {
        acc[tipo] = [];
      }
      acc[tipo].push(invitacion);
      return acc;
    }, {} as { [key: string]: ExampleInvitation[] });
  }

  /**
   * Ordena los grupos poniendo "Boda" primero
   */
  private ordenarGrupos(): void {
    const grupos = Object.entries(this.invitacionesAgrupadas).map(([key, value]) => ({ key, value }));
    
    // Ordenar poniendo "Boda" primero
    this.invitacionesAgrupadasOrdenadas = grupos.sort((a, b) => {
      if (a.key === 'Boda') return -1;
      if (b.key === 'Boda') return 1;
      return a.key.localeCompare(b.key);
    });
  }

  /**
   * Obtiene la descripción según el tipo de invitación
   * @param tipo - El tipo de invitación
   * @returns string con la descripción
   */
  getDescripcionTipo(tipo: string): string {
    const descripciones: { [key: string]: string } = {
      'Boda': 'Diseño elegante y moderno para tu boda',
      'Cumpleaños': 'Diseño elegante y moderno para tu cumpleaños',
      'Bautizo': 'Diseño elegante y moderno para tu bautizo'
    };
    return descripciones[tipo] || 'Diseño elegante y moderno para tu evento';
  }

  goToTemplate(template: ExampleInvitation) {
    window.open(template.url, '_system');
  }

  /**
   * Maneja el evento de "Conocer más" de una invitación
   * @param invitacion - La invitación seleccionada
   */
  verMas(invitacion: ExampleInvitation): void {
    console.log('Conocer más de:', invitacion);
    //REDIRIGIR A WS PIDIENDO INFORMACION SOBRE EL EMPLATE SELECCIONADO, USANDO WINDOW.OPEN _SYSTEM

    const numero = '18093716874';
    const mensaje = `Hola, me gustaría recibir información sobre el template "${invitacion.name}" (ID: ${invitacion.id}).`;
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_system');

    // Aquí puedes implementar la navegación o modal para ver más detalles
    // Por ejemplo:
    // this.router.navigate(['/invitacion', invitacion.id]);
    // o abrir un modal con más información
  }

  /**
   * Obtiene el icono correspondiente al tipo de invitación
   * @param tipo - El tipo de invitación
   * @returns string con el nombre del icono
   */
  getIconoTipo(tipo: string): string {
    const iconos: { [key: string]: string } = {
      'Boda': 'heart',
      'Cumpleaños': 'gift',
      'Bautizo': 'sparkles'
    };
    return iconos[tipo] || 'calendar';
  }

  /**
   * Maneja errores de carga de imágenes
   * @param event - Evento de error
   */
  onImageError(event: any): void {
    console.error('Error cargando imagen:', event);
    // Puedes establecer una imagen por defecto aquí
    event.target.src = 'assets/images/placeholder.jpg';
  }

  /**
   * Optimiza la carga de imágenes
   * @param event - Evento de carga
   */
  onImageLoad(event: any): void {
    // Imagen cargada exitosamente
    event.target.classList.add('loaded');
  }
}
