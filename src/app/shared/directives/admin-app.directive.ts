import {
  Directive, ElementRef, Input, Renderer2, OnInit, OnChanges,
  HostListener, HostBinding, RendererStyleFlags2, SimpleChanges
} from '@angular/core';
import { EVENT_STATE } from 'src/app/core/constants/constants';
import { FeatureFlagKey } from 'src/app/core/enums/featureFlag.enum';
import { FeatureFlagHelper } from 'src/app/core/helpers/featureflag.helper';
import { remoteConfig } from 'src/environments/environment.remoteconfig';

@Directive({
  selector: '[adminAction]',
  standalone: true
})
export class AdminAppDirective implements OnInit, OnChanges {

  @Input('adminAction') adminAction: string = '';

  private blocked = false;
  private readonly hideWhenBlocked = true; // igual que tu versión: display:none

  // Accesibilidad + UX
  @HostBinding('attr.aria-disabled') get ariaDisabled() { return this.blocked ? 'true' : null; }
  @HostBinding('attr.disabled') get disabledAttr() { return this.blocked ? '' : null; }
  @HostBinding('attr.tabindex') get tabIndex() { return this.blocked ? -1 : null; }
  @HostBinding('attr.inert') get inertAttr() { return this.blocked ? '' : null; }
  @HostBinding('class.admin-action-disabled') get cssClass() { return this.blocked; }
  @HostBinding('attr.aria-hidden') get ariaHidden() { return this.blocked && this.hideWhenBlocked ? 'true' : null; }

  constructor(private el: ElementRef<HTMLElement>, private renderer: Renderer2) { }

  ngOnInit(): void { this.apply(); }
  ngOnChanges(_: SimpleChanges): void { this.apply(); }

  private apply(): void {
    // Permitido si adminAction está en la lista de ADMINS_USERS
    const allowed = Array.isArray(remoteConfig.ADMINS_USERS)
      && remoteConfig.ADMINS_USERS.some(r => r === this.adminAction);

    this.blocked = !allowed;


    if (!FeatureFlagHelper.isFeatureActive(FeatureFlagKey.RESTRICTIONS_ADMIN)) {
      this.blocked = false;
    }


    if (this.blocked) {
      if (this.hideWhenBlocked) {
        this.renderer.setStyle(this.el.nativeElement, 'display', 'none', RendererStyleFlags2.Important);
      }
      // Estilos cosméticos (el bloqueo real lo hacen los HostListener)
      this.renderer.setStyle(this.el.nativeElement, 'opacity', '0.5', RendererStyleFlags2.Important);
      this.renderer.setStyle(this.el.nativeElement, 'cursor', 'not-allowed', RendererStyleFlags2.Important);
    } else {
      // Limpia estilos si luego pasa a estar permitido
      this.renderer.removeStyle(this.el.nativeElement, 'display');
      this.renderer.removeStyle(this.el.nativeElement, 'opacity');
      this.renderer.removeStyle(this.el.nativeElement, 'cursor');
    }
  }

  // Bloqueo REAL del click aunque quiten estilos/atributos en el inspector
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

  // Si necesitas el rol en el futuro:
  private getCurrentUserRole(): string {
    return EVENT_STATE.eventRole;
  }
}
