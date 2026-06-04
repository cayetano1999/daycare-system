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

  allChildren: Child[] = [];
  children: Child[] = [];
  filteredChildren: Child[] = [];
  loading = true;
  searchTerm = '';

  months = [
    { name: 'Enero', value: 1 },
    { name: 'Febrero', value: 2 },
    { name: 'Marzo', value: 3 },
    { name: 'Abril', value: 4 },
    { name: 'Mayo', value: 5 },
    { name: 'Junio', value: 6 },
    { name: 'Julio', value: 7 },
    { name: 'Agosto', value: 8 },
    { name: 'Septiembre', value: 9 },
    { name: 'Octubre', value: 10 },
    { name: 'Noviembre', value: 11 },
    { name: 'Diciembre', value: 12 }
  ];
  selectedMonth: number = new Date().getMonth() + 1;

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
        this.allChildren = data.map(child => ({
          id: child.id,
          full_name: child.full_name,
          avatar_url: child.avatar_url,
          birth_date: child.birth_date,
          gender: child.gender,
          schedule_description: child.schedule_description,
          ciclo: child.ciclo
        }));
        
        this.filterByMonth();
      } else {
        this.allChildren = [];
        this.children = [];
        this.applyFilters();
      }
    } catch (error) {
      console.error('Error loading children:', error);
    } finally {
      this.loading = false;
    }
  }

  filterByMonth(): void {
    this.children = this.allChildren
      .filter(child => {
        if (!child.birth_date) return false;
        const birthDateParts = child.birth_date.split('-');
        if (birthDateParts.length >= 2) {
          const bMonth = parseInt(birthDateParts[1], 10);
          return bMonth === this.selectedMonth;
        }
        return false;
      });

    // Ordenar por el día del mes
    this.children.sort((a, b) => {
      const dayA = parseInt(a.birth_date.split('-')[2].split('T')[0], 10);
      const dayB = parseInt(b.birth_date.split('-')[2].split('T')[0], 10);
      return dayA - dayB;
    });

    this.applyFilters();
  }

  selectMonth(monthValue: number): void {
    this.selectedMonth = monthValue;
    this.filterByMonth();
  }

  getSelectedMonthName(): string {
    const month = this.months.find(m => m.value === this.selectedMonth);
    return month ? month.name : '';
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
