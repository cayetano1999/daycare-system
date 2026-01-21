import { Component, OnInit } from '@angular/core';
import { InscriptionComponent } from 'src/app/shared/daycare/inscription/inscription.component';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';

@Component({
  selector: 'app-inscription-page',
  templateUrl: './inscription.page.html',
  styleUrls: ['./inscription.page.scss'],
  standalone: true,
  imports: [InscriptionComponent, ...StandAloneModules],
})
export class InscriptionPage implements OnInit {

  constructor() { }

  ngOnInit() {}

}
