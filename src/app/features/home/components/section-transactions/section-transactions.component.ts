import { Component, Input, OnInit } from '@angular/core';
import { Transaction } from '../../home.page';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-section-transactions',
  templateUrl: './section-transactions.component.html',
  styleUrls: ['./section-transactions.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class SectionTransactionsComponent  implements OnInit {

  //Inputs
  @Input() transactions: Transaction[] = [];

  constructor() { }

  ngOnInit() {}

}
