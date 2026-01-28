import { Component, inject, Input, OnInit } from '@angular/core';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
@Component({
  selector: 'app-indicators-board',
  templateUrl: './indicators-board.component.html',
  styleUrls: ['./indicators-board.component.scss'],
    imports: [...StandAloneModules, IonicModule],
  
})
export class IndicatorsBoardComponent  implements OnInit {
router = inject(Router);
  @Input() data: any;

  constructor() {
  
  }

  getIconForActivity(activity: any): string {
    switch (activity.type) {
      case 'registration':
        return 'person-add-outline';
      case 'payment':
        return 'cash-outline';
      case 'child':
        return 'accessibility-outline';
      default:
        return 'notifications-outline';
    }
  }

  ngOnInit() {}

  redirect(path: string){
    this.router.navigate([path], { replaceUrl: true });
  }

}
