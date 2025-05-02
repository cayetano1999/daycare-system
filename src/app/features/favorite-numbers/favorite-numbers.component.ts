import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { KuidoHeaderComponent } from 'src/app/shared/components/kuido-header/kuido-header.component';
interface Contact {
  id: number;
  name: string;
  phone: string;
  image: string;
  isFavorite: boolean;
}

@Component({
  selector: 'app-favorite-numbers',
  templateUrl: './favorite-numbers.component.html',
  styleUrls: ['./favorite-numbers.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, KuidoHeaderComponent]
})
export class FavoriteNumbersComponent  implements OnInit {

  contacts: Contact[] = [
    {
      id: 1,
      name: 'Kathya Yu',
      phone: '(+84) 984 943 432',
      image: 'assets/img/shared/person.svg',
      isFavorite: true,
    },
    {
      id: 2,
      name: 'Arlene McCoy',
      phone: '(307) 555-0133',
      image: 'assets/img/shared/profile.svg',
      isFavorite: false,
    }
  ];

  constructor() { }

  ngOnInit() {}

}
