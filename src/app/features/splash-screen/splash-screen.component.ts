import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';
import { COLORS } from 'src/app/core/constants/constants';
import { StatusBarHelper } from 'src/app/core/helpers/status-bar.helper';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { HeaderSplashComponent } from './components/header-splash/header-splash.component';
import { BodySplashComponent } from './components/body-splash/body-splash.component';
import { RoutesApp } from 'src/app/core/enums/routes.enum';

@Component({
  selector: 'app-splash-screen',
  templateUrl: './splash-screen.component.html',
  styleUrls: ['./splash-screen.component.scss'],
  imports: [IonicModule, CommonModule, HeaderSplashComponent, BodySplashComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SplashScreenComponent {
  //services
  private readonly statusBar = inject(StatusBarHelper);
  private readonly navController = inject(NavController);


  handleOnNextClick(event?: any) {
    // Handle next button click
    this.navController.navigateForward(RoutesApp.LOGIN_PREVIEW);
  }

  handleNoLoginVersion(event?: any) {
    // Handle no login version click
  }

  //Lifecycle
  async ionViewWillEnter() {
    await this.statusBar.setStatusBarStyle(COLORS.primaryGreen);
  }

}
