import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss'],
  imports: [IonicModule, CommonModule]

})
export class LanguageSelectorComponent implements OnInit {
  @Input() languages: string[] = [];
  @Input() selectedLanguage: string | null = null;

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {}

  selectLanguage(language: string) {
    this.selectedLanguage = language;
    this.modalCtrl.dismiss(language);
  }
}
