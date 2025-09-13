import {
  Directive, Input, ElementRef, Renderer2, OnInit, OnChanges,
  HostListener, HostBinding, RendererStyleFlags2, SimpleChanges
} from '@angular/core';
import { EVENT_STATE } from 'src/app/core/constants/constants';

@Directive({
  selector: '[appRoleAccess]',
  standalone: true
})
export class RoleAccessDirective implements OnInit, OnChanges {

  @Input('appRoleAccess') allowedRoles: string[] = [];

  private userRole: string = '';   // Ej: 'Lectura', 'Escritura', 'Admin'
  private blocked = false;

  // Accesibilidad + UX
  @HostBinding('attr.aria-disabled') get ariaDisabled() { return this.blocked ? 'true' : null; }
  @HostBinding('attr.disabled')      get disabledAttr() { return this.blocked ? '' : null; }
  @HostBinding('attr.tabindex')      get tabIndex()     { return this.blocked ? -1 : null; }
  @HostBinding('class.role-access-disabled') get cssClass() { return this.blocked; }

  constructor(private el: ElementRef<HTMLElement>, private renderer: Renderer2) {}

  ngOnInit(): void { this.apply(); }
  ngOnChanges(_: SimpleChanges): void { this.apply(); }

  private apply(): void {
    this.userRole = this.getCurrentUserRole();

    // Si no pasan roles, NO bloquea (para evitar bloquear por defecto)
    this.blocked = (this.allowedRoles?.length ?? 0) > 0 && !this.allowedRoles.includes(this.userRole);
    
    if (this.blocked) {
      // Estilos cosméticos (el bloqueo real es con HostListener)
      this.renderer.setStyle(this.el.nativeElement, 'opacity', '0.5', RendererStyleFlags2.Important);
      this.renderer.setStyle(this.el.nativeElement, 'cursor', 'not-allowed', RendererStyleFlags2.Important);
      // opcional: ignorar clicks del mouse visualmente
      // this.renderer.setStyle(this.el.nativeElement, 'pointer-events', 'none', RendererStyleFlags2.Important);
    } else {
      this.renderer.removeStyle(this.el.nativeElement, 'opacity');
      this.renderer.removeStyle(this.el.nativeElement, 'cursor');
      // this.renderer.removeStyle(this.el.nativeElement, 'pointer-events');
    }
  }

  // Bloqueo REAL del click
  @HostListener('click', ['$event'])
  onClick(ev: MouseEvent) {
    if (this.blocked) {
      ev.preventDefault();
      ev.stopImmediatePropagation();
      ev.stopPropagation();
      return false;
    }
    return true;
  }

  // Bloqueo por teclado (Enter / Space)
  @HostListener('keydown.enter', ['$event'])
  @HostListener('keydown.space', ['$event'])
  onKey(ev: KeyboardEvent) {
    if (this.blocked) {
      ev.preventDefault();
      ev.stopImmediatePropagation();
      ev.stopPropagation();
      return false;
    }
    return true;
  }

  // Reemplaza con tu servicio real de roles
  private getCurrentUserRole(): string {
    return EVENT_STATE.eventRole;
  }
}
