import { Component, inject, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import {AvatarModule} from 'primeng/avatar';
import {OverlayBadgeModule} from 'primeng/overlaybadge';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { StatusBarHelper } from 'src/app/core/helpers/status-bar.helper';
import { COLORS } from 'src/app/core/constants/constants';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, AvatarModule, CardModule, TagModule]
})
export class HomePage  implements OnInit {

  //Services
  statusBar = inject(StatusBarHelper)
  constructor() { }

  ngOnInit() {}

  //Lifecycle
  async ionViewWillEnter() { 
    await this.statusBar.setStatusBarStyle(COLORS.white)

  }

}
