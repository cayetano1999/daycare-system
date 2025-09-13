import {
  Directive, Input, ElementRef, Renderer2, OnInit, OnChanges,
  HostListener, HostBinding, RendererStyleFlags2, SimpleChanges
} from '@angular/core';
import { EVENT_STATE } from 'src/app/core/constants/constants';
import { FeatureFlagKey } from 'src/app/core/enums/featureFlag.enum';
import { FeatureFlagHelper } from 'src/app/core/helpers/featureflag.helper';
import { remoteConfig } from 'src/environments/environment.remoteconfig';

@Directive({
  selector: '[eventActionRestrictions]',
  standalone: true
})
export class EventActionRestrictions implements OnInit, OnChanges {

  // Mantengo tu input con el mismo nombre que ya usas en el template
  @Input('currentEventType') eventData!: {
    code: string,
    module: string,
    action: string
  };

  private blocked = false;

  // Accesibilidad + comportamiento
  @HostBinding('attr.aria-disabled') get ariaDisabled() { return this.blocked ? 'true' : null; }
  @HostBinding('attr.disabled')      get disabledAttr() { return this.blocked ? '' : null; }
  @HostBinding('attr.tabindex')      get tabIndex()     { return this.blocked ? -1 : null; }
  @HostBinding('class.event-action-disabled') get cssClass() { return this.blocked; }

  constructor(private el: ElementRef<HTMLElement>, private renderer: Renderer2) {}

  ngOnInit(): void  { this.apply(); }
  ngOnChanges(_: SimpleChanges): void { this.apply(); }

  private apply(): void {
    // 1) FF activo?
    const isFfRestrictionsActive =
      FeatureFlagHelper.isFeatureActive(FeatureFlagKey.EVENT_MODULES_RESTRICTIONS);

    // 2) Plan y feature
    const plan = remoteConfig.FESTIVA_PLANS_TEMPLATE.FESTIVA_PLANS
      ?.find(p => p.code?.toLowerCase() === this.eventData?.code?.toLowerCase());

    const feature: any = plan?.features?.[this.eventData?.module as keyof object];

    // 3) ¿Bloquear?
    this.blocked = !!isFfRestrictionsActive && feature && feature.enabled === false;

    // 4) Estilos (cosmético, el bloqueo real lo hace el HostListener)
    if (this.blocked) {
      this.renderer.setStyle(this.el.nativeElement, 'opacity', '0.5', RendererStyleFlags2.Important);
      this.renderer.setStyle(this.el.nativeElement, 'cursor', 'not-allowed', RendererStyleFlags2.Important);
      // opcional: visualmente ignora clicks del mouse
      // this.renderer.setStyle(this.el.nativeElement, 'pointer-events', 'none', RendererStyleFlags2.Important);
    } else {
      this.renderer.removeStyle(this.el.nativeElement, 'opacity');
      this.renderer.removeStyle(this.el.nativeElement, 'cursor');
      // this.renderer.removeStyle(this.el.nativeElement, 'pointer-events');
    }
  }

  // BLOQUEO REAL: evita que llegue al (click) del template
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

  // Bloquea activación por teclado (Enter/Espacio)
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

  // Si usas roles en el futuro:
  private getCurrentUserRole(): string {
    return EVENT_STATE.eventRole;
  }
}
