import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IonIcon } from "@ionic/angular/standalone";
import { StandAloneModules } from '../../stand-alone-module';

@Component({
  selector: 'app-custom-header',
  templateUrl: './custom-header.component.html',
  styleUrls: ['./custom-header.component.scss'],
  standalone: true,
  imports:[...StandAloneModules]
})
export class CustomHeaderComponent  implements OnInit {

  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() showRightBtn: boolean = false;
  @Input() textRightBtn: string = '';
  @Input() iconRightBtn: string = '';

  @Output() rightBtnClick = new EventEmitter<void>();

  constructor() { }

  ngOnInit() {
    
  }

  onRightBtnClick() {
    this.rightBtnClick.emit();
  }

}
