import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { IonContent } from "@ionic/angular/standalone";
import { StandAloneModules } from 'src/app/shared/stand-alone-module';
import { GuardianManagementComponent } from "src/app/shared/daycare/guardian-management/guardian-management.component";

@Component({
  selector: 'app-authorized-picker-page',
  templateUrl: './authorized-picker.page.html',
  styleUrls: ['./authorized-picker.page.scss'],
  standalone: true,
  imports: [...StandAloneModules, IonicModule, GuardianManagementComponent]
})
export class AuthorizedPickerPage  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
