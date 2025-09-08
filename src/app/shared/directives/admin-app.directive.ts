import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';
import { EVENT_STATE } from 'src/app/core/constants/constants';
import { remoteConfig } from 'src/environments/environment.remoteconfig';

@Directive({
  selector: '[adminAction]',
  standalone: true
})
export class AdminAppDirective {

  @Input('adminAction') adminAction: string = '';

  // Suponiendo que tienes un servicio que te da el rol actual del usuario en el evento
  private userRole: string = ''; // Ej: 'Lectura', 'Escritura', 'Admin'

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    // Simulamos obtener el rol actual (deberías cambiar esto por tu lógica real)
    this.userRole = this.getCurrentUserRole();

    if (!remoteConfig.ADMINS_USERS.some(r => r === this.adminAction)) {
      this.renderer.setProperty(this.el.nativeElement, 'disabled', true);
      this.renderer.setStyle(this.el.nativeElement, 'opacity', '0.5');
      this.renderer.setStyle(this.el.nativeElement, 'cursor', 'not-allowed');
      this.renderer.setStyle(this.el.nativeElement, 'display', 'none');
    }
  }

  // Reemplaza este método por el servicio real de roles
  getCurrentUserRole(): string {
    // Por ejemplo, puedes obtenerlo desde un servicio que retorne el rol del usuario logueado en este evento
    return EVENT_STATE.eventRole;
  }

}
