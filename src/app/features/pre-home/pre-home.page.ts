import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit, signal, Signal } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { StatusBarHelper } from 'src/app/core/helpers/status-bar.helper';
import { COLORS } from 'src/app/core/constants/constants';
import { Router } from '@angular/router';
import { RoutesApp } from 'src/app/core/enums/routes.enum';

import { mirage } from 'ldrs'
mirage.register()
@Component({
  selector: 'app-pre-home',
  templateUrl: './pre-home.page.html',
  styleUrls: ['./pre-home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, PipesModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PreHomePage {
  private readonly statusBar = inject(StatusBarHelper);
  private readonly router = inject(Router);

  //properties
  loading = signal(true);

  //Lifecycle
  async ionViewWillEnter() {
    await this.statusBar.setStatusBarStyle(COLORS.white);
    setTimeout(() => {
      this.loading.update(() => false);
      setTimeout(() => {
        this.router.navigate([RoutesApp.SPLASH]);
      }, 300);
    }, 2000);
  }

}
