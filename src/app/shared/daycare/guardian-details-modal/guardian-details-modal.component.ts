import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SupabaseService } from 'src/app/core/services/supabase.service';

import { ModalController } from '@ionic/angular/standalone';

interface Guardian {
  id: string;
  full_name: string;
  identification_type: string;
  identification_number: string;
  phone_number: string | null;
  workplace: string | null;
  created_at: string;
}

interface Child {
  id: string;
  full_name: string;
  birth_date: string;
  gender: string;
  ciclo: string | null;
  relationship: string;
  is_primary: boolean;
}

@Component({
  selector: 'app-guardian-details-modal',
  templateUrl: './guardian-details-modal.component.html',
  styleUrls: ['./guardian-details-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
  providers: [ModalController]
})
export class GuardianDetailsModalComponent implements OnInit {
  @Input() guardian!: Guardian;
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();


  supabaseService = inject(SupabaseService);
  modalCtrl = inject(ModalController);

  children: Child[] = [];
  loading: boolean = false;

  constructor() {
  
  }

  ngOnInit() {
    if (this.guardian) {
      this.loadChildren();
    }
  }

  async loadChildren() {
    this.loading = true;
    try {
      const supabase = this.supabaseService.getSupabase();

      const { data, error } = await supabase
        .from('children_legal_parents')
        .select(`
          relationship,
          is_primary,
          children:children_id (
            id,
            full_name,
            birth_date,
            gender,
            ciclo
          )
        `)
        .eq('legal_parent_id', this.guardian.id);

      if (error) throw error;

      this.children = (data || []).map((item: any) => ({
        ...item.children,
        relationship: item.relationship,
        is_primary: item.is_primary
      }));

      this.children.sort((a, b) => {
        if (a.is_primary && !b.is_primary) return -1;
        if (!a.is_primary && b.is_primary) return 1;
        return a.full_name.localeCompare(b.full_name);
      });

    } catch (error) {
      console.error('Error loading children:', error);
    } finally {
      this.loading = false;
    }
  }

  closeModal() {
    this.modalCtrl.dismiss();
    this.close.emit();
  }

  getInitial(name: string): string {
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'No especificado';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  calculateAge(birthDate: string): number {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  getGenderIcon(gender: string): string {
    return gender?.toLowerCase() === 'masculino' ? 'male-outline' : 'female-outline';
  }

  getGenderColor(gender: string): string {
    return gender?.toLowerCase() === 'masculino' ? 'text-blue-600' : 'text-pink-600';
  }
}
