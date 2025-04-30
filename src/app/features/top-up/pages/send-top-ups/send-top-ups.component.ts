import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertController, IonicModule, NavController } from '@ionic/angular';
import { AlertControllerService } from 'src/app/core/services/ionic/alert-controller.service';
import { KuidoHeaderComponent } from 'src/app/shared/components/kuido-header/kuido-header.component';
import { KuidoTabComponent } from 'src/app/shared/components/kuido-tab/kuido-tab.component';

interface TopUpOption {
  id: number;
  usdAmount: number;
  dopAmount: number;
  icon: string;
  isSelected: boolean;
}

@Component({
  selector: 'app-send-top-ups',
  templateUrl: './send-top-ups.component.html',
  styleUrls: ['./send-top-ups.component.scss'],
    imports: [IonicModule, CommonModule, FormsModule, KuidoHeaderComponent, KuidoTabComponent]
  
})
export class SendTopUpsComponent implements OnInit {

  //Services
  private readonly navCtrl = inject(NavController);
  private readonly alertCtrl = inject(AlertControllerService);

  amount: number = 0;
  topUpOptions: TopUpOption[] = [
    {
      id: 1,
      usdAmount: 4.99,
      dopAmount: 317.25,
      icon: '/assets/img/shared/sendtopup.svg',
      isSelected: true
    },
    {
      id: 2,
      usdAmount: 9.99,
      dopAmount: 634.50,
      icon: '/assets/img/shared/sendtopup.svg',
      isSelected: false
    },
    {
      id: 3,
      usdAmount: 14.99,
      dopAmount: 951.75,
      icon: '/assets/img/shared/sendtopup.svg',
      isSelected: false
    }
  ];


  ngOnInit() {}

  goBack() {
    this.navCtrl.back();
  }

  selectTopUp(selectedOption: TopUpOption) {
    this.topUpOptions = this.topUpOptions.map(option => ({
      ...option,
      isSelected: option.id === selectedOption.id
    }));
    this.amount = selectedOption.usdAmount;
  }

  async confirmTopUp() { 
    const result = await this.alertCtrl.openModalConfirmTopUp();
    result?.success ? this.alertCtrl.openModalTopUpSuccess() : null

    
  }
}