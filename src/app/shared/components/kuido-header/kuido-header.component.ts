import { Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-kuido-header',
  templateUrl: './kuido-header.component.html',
  styleUrls: ['./kuido-header.component.scss'],
  standalone: true,
  imports: [IonicModule]
})
export class KuidoHeaderComponent  implements OnInit {

  //Inputs
  @Input() title: string = '';

  constructor() { }

  ngOnInit() {}

}
