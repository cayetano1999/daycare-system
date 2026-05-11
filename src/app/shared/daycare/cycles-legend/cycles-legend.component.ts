import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { informationCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-cycles-legend',
  standalone: true,
  imports: [CommonModule, IonIcon],
  templateUrl: './cycles-legend.component.html',
  styleUrls: ['./cycles-legend.component.scss']
})
export class CyclesLegendComponent {
  constructor() {
    addIcons({ informationCircleOutline });
  }
}
