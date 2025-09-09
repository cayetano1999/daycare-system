import { Component, inject, Input, OnInit } from '@angular/core';
import { StandAloneModules } from '../../stand-alone-module';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-gif-template',
  templateUrl: './modal-gif-template.component.html',
  styleUrls: ['./modal-gif-template.component.scss'],
  standalone: true,
  imports: [...StandAloneModules]
})
export class ModalGifTemplateComponent  implements OnInit {

  @Input() imgUrl: string = '';

  private readonly modalCtrl = inject(ModalController);
  constructor() { }

  ngOnInit() {}

  close(){
    this.modalCtrl.dismiss();
  }


  

}
