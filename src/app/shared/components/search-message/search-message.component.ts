import { Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
    selector: 'app-search-message',
    templateUrl: './search-message.component.html',
    styleUrls: ['./search-message.component.scss'],
    standalone: true,
    imports:[IonicModule]
})
export class SearchMessageComponent   {

  @Input() message: string = '';
  @Input() image: string = '';
  constructor() { }


}
