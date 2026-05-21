import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseClient } from '@supabase/supabase-js';
import { Subject } from 'rxjs';
import { IonContent, IonIcon } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { giftOutline, gift } from 'ionicons/icons';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { calculateAgeToString } from 'src/app/core/constants/constants';

interface Child {
  id: string;
  full_name: string;
  avatar_url: string;
  birth_date: string;
  gender: string;
  schedule_description?: string;
  ciclo?: string;
}

@Component({
  selector: 'app-birthdays',
  standalone: true,
  imports: [IonIcon, IonContent, CommonModule, FormsModule],
  templateUrl: './birthdays.component.html',
  styleUrls: ['./birthdays.component.scss']
})
export class BirthdaysComponent implements OnInit, OnDestroy {
  private supabase: SupabaseClient;
  private destroy$ = new Subject<void>();

  supabaseService = inject(SupabaseService);

  children: Child[] = [];
  filteredChildren: Child[] = [];
  loading = true;
  searchTerm = '';

  constructor() {
    this.supabase = this.supabaseService.getSupabase();
    addIcons({ giftOutline, gift });
  }

  ngOnInit(): void {
    this.loadChildren();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadChildren(): Promise<void> {
    this.loading = true;
    try {
      const { data, error } = await this.supabase
        .from('children_with_active_registration')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) throw error;

      if (data) {
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentDay = today.getDate();

        this.children = data
          .map(child => ({
            id: child.id,
            full_name: child.full_name,
            avatar_url: child.avatar_url,
            birth_date: child.birth_date,
            gender: child.gender,
            schedule_description: child.schedule_description,
            ciclo: child.ciclo
          }))
          .filter(child => {
            if (!child.birth_date) return false;
            // Parse birth_date (assuming format YYYY-MM-DD or valid ISO)
            const birthDateParts = child.birth_date.split('-');
            if (birthDateParts.length >= 3) {
              const bMonth = parseInt(birthDateParts[1], 10);
              const bDay = parseInt(birthDateParts[2].split('T')[0], 10);
              return bMonth === currentMonth && bDay === currentDay;
            }
            return false;
          });
      }

      this.applyFilters();
    } catch (error) {
      console.error('Error loading children:', error);
    } finally {
      this.loading = false;
    }
  }

  applyFilters(): void {
    if (!this.searchTerm) {
      this.filteredChildren = [...this.children];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredChildren = this.children.filter(child =>
      child.full_name.toLowerCase().includes(term)
    );
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  calculateAge(birthDate: string): string {
    return calculateAgeToString(birthDate);
  }
}
