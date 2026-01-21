import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { IonContent } from "@ionic/angular/standalone";
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { StandAloneModules } from '../../stand-alone-module';

interface Schedule {
  id: string;
  description: string;
  status: 'ACTIVA' | 'INACTIVA';
  created_at?: string;
  updated_at?: string;
}

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss'],
  standalone: true,
  imports: [...StandAloneModules],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ScheduleComponent implements OnInit {
  private supabase: SupabaseClient;

  schedules: Schedule[] = [];
  filteredSchedules: Schedule[] = [];
  searchValue: string = '';
  statusFilter: string = 'all';

  isAddingNew: boolean = false;
  editingScheduleId: string | null = null;

  newSchedule = {
    description: '',
    status: 'ACTIVA' as 'ACTIVA' | 'INACTIVA'
  };

  editForm = {
    description: '',
    status: 'ACTIVA' as 'ACTIVA' | 'INACTIVA'
  };

  loading: boolean = false;

  constructor() {
    const supabaseUrl = 'https://cchztsiivmddznqtevrw.supabase.co';
    const supabaseKey = 'sb_publishable_LcCBe5kNxddZYO3JVseRHw_TYeCJ7BU';
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async ngOnInit() {
    await this.loadSchedules();
  }

  async loadSchedules() {
    this.loading = true;
    try {
      const { data, error } = await this.supabase
        .from('schedules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      this.schedules = data || [];
      this.applyFilters();
    } catch (error) {
      console.error('Error loading schedules:', error);
    } finally {
      this.loading = false;
    }
  }

  applyFilters() {
    let filtered = [...this.schedules];

    if (this.searchValue) {
      const value = this.searchValue.toLowerCase();
      filtered = filtered.filter(schedule =>
        schedule.description.toLowerCase().includes(value)
      );
    }

    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(schedule => schedule.status === this.statusFilter);
    }

    this.filteredSchedules = filtered;
  }

  clearFilters() {
    this.searchValue = '';
    this.statusFilter = 'all';
    this.applyFilters();
  }

  showAddForm() {
    this.isAddingNew = true;
    this.newSchedule = {
      description: '',
      status: 'ACTIVA'
    };
  }

  cancelAdd() {
    this.isAddingNew = false;
    this.newSchedule = {
      description: '',
      status: 'ACTIVA'
    };
  }

  async saveNew() {
    if (!this.newSchedule.description.trim()) {
      return;
    }

    this.loading = true;
    try {
      const { data, error } = await this.supabase
        .from('schedules')
        .insert([{
          description: this.newSchedule.description.trim(),
          status: this.newSchedule.status
        }])
        .select();

      if (error) throw error;

      await this.loadSchedules();
      this.cancelAdd();
    } catch (error) {
      console.error('Error creating schedule:', error);
    } finally {
      this.loading = false;
    }
  }

  startEdit(schedule: Schedule) {
    this.editingScheduleId = schedule.id;
    this.editForm = {
      description: schedule.description,
      status: schedule.status
    };
  }

  cancelEdit() {
    this.editingScheduleId = null;
    this.editForm = {
      description: '',
      status: 'ACTIVA'
    };
  }

  async saveEdit(scheduleId: string) {
    if (!this.editForm.description.trim()) {
      return;
    }

    this.loading = true;
    try {
      const { error } = await this.supabase
        .from('schedules')
        .update({
          description: this.editForm.description.trim(),
          status: this.editForm.status
        })
        .eq('id', scheduleId);

      if (error) throw error;

      await this.loadSchedules();
      this.cancelEdit();
    } catch (error) {
      console.error('Error updating schedule:', error);
    } finally {
      this.loading = false;
    }
  }

  async toggleStatus(schedule: Schedule) {
    this.loading = true;
    try {
      const newStatus = schedule.status === 'ACTIVA' ? 'INACTIVA' : 'ACTIVA';

      const { error } = await this.supabase
        .from('schedules')
        .update({ status: newStatus })
        .eq('id', schedule.id);

      if (error) throw error;

      await this.loadSchedules();
    } catch (error) {
      console.error('Error toggling status:', error);
    } finally {
      this.loading = false;
    }
  }

  async deleteSchedule(schedule: Schedule) {
    if (!confirm(`¿Estás seguro de eliminar la tanda "${schedule.description}"?`)) {
      return;
    }

    this.loading = true;
    try {
      const { error } = await this.supabase
        .from('schedules')
        .delete()
        .eq('id', schedule.id);

      if (error) throw error;

      await this.loadSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
    } finally {
      this.loading = false;
    }
  }

  getActiveCount(): number {
    return this.schedules.filter(s => s.status === 'ACTIVA').length;
  }

  getInactiveCount(): number {
    return this.schedules.filter(s => s.status === 'INACTIVA').length;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
