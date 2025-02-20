import { Component, inject } from '@angular/core';
import { COLORS } from 'src/app/core/constants/constants';
import { StatusBarHelper } from 'src/app/core/helpers/status-bar.helper';

@Component({
    selector: 'app-pre-home',
    templateUrl: './pre-home.page.html',
    styleUrls: ['./pre-home.page.scss'],
    standalone: false
})
export class PreHomePage {

  //Services
  private readonly statusBar = inject(StatusBarHelper);

  //Properties
  animationReady: boolean = false;

  constructor() { }

  //Lifecycle
  async ionViewWillEnter() {
    await this.statusBar.setStatusBarStyle(COLORS.green);
    setTimeout(() => {
      this.animationReady = true;
    }, 1000);
   }
}
