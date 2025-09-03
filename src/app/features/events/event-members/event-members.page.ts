import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { StorageKeys } from 'src/app/core/enums/storage.keys.enum';
import { StorageHelper } from 'src/app/core/helpers/storage.helper';
import { FestivaEvent } from 'src/app/core/interface/event.interface';
import { Profile } from 'src/app/core/interface/profile.interface';
import { AlertControllerService } from 'src/app/core/services/ionic/alert-controller.service';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';

interface EventMember {
  id: string;
  created_at: string;
  user_id: string;
  event_id: string;
  role: 'Lectura' | 'Escritura' | 'Admin';
  user?: {
    id: string;
    full_name: string;
    avatar_url: string;
    email?: string;
  };
}

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string;
  email?: string;
}

@Component({
  selector: 'app-event-members',
  templateUrl: './event-members.page.html',
  styleUrls: ['./event-members.page.scss'],
  imports:[...StandAloneModules]
})
export class EventMembersPage implements OnInit {
  members: EventMember[] = [];
  eventId: string = 'event-1'; // TODO: Get from route params
  eventName: string = 'de María y José'; // TODO: Get from event data
  isLoading: boolean = true;
  defaultAvatar: string = 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2';

  // Modal state
  showMemberModal: boolean = false;
  modalMode: 'create' | 'edit' = 'create';
  editingMember: EventMember | null = null;

  // Search state
  searchEmail: string = '';
  searchResults: UserProfile[] = [];
  selectedUser: UserProfile | null = null;
  selectedRole: 'Lectura' | 'Escritura' | 'Admin' = 'Lectura';
  
  // Loading states
  isSearching: boolean = false;
  isSubmitting: boolean = false;
  
  // Error handling
  searchError: string = '';

  // Delete confirmation
  showDeleteConfirm: boolean = false;
  memberToDelete: string | null = null;
  event: FestivaEvent | null = null;
  user: Profile | null = null;

  private router = inject(Router);
  private storageHelper = inject(StorageHelper);
  private readonly alertCtrl = inject(AlertControllerService);
  private navCtrl = inject(NavController);

  constructor(private supabaseService: SupabaseService) {

    
  }

  ngOnInit() {
  }

  async ionViewWillEnter() {
   
     const state = this.router.getCurrentNavigation()?.extras?.state ?? history.state;
    if (state?.event) this.event = state.event;

    if (this.event) {
      this.eventId = this.event.id || '';
    }

    this.user = await this.storageHelper.getStorageKey(StorageKeys.USER_DATA);
    await this.loadMembers();
  }

  async loadMembers() {
    this.isLoading = true;
    
    try {
      // Get members with user profile data
      const { data, error } = await this.supabaseService.getRecords<EventMember>(
        'event_members',
        ['*', 'user_profiles(*)'],
        'event_id',
        this.eventId,
        'created_at'
      );

      if (error) {
        console.error('Error loading members:', error);
        this.showToast('Error al cargar los miembros', 'error');
        return;
      }
      console.log('Loaded members:', data);
      // Transform data to match our interface
      this.members = (data || []).map((member: any) => ({
        ...member,
        user: member.user_profiles
      }));
      console.log('Transformed members:', this.members);

    } catch (error) {
      console.error('Error loading members:', error);
      this.showToast('Error al cargar los miembros', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  openAddMemberModal() {

    if(this.members.length > 0){
      this.alertCtrl.openFestivaAlert("warning", "Ya hay miembros en este evento", 'No se puede registrar más miembros', false, 'Entendido');
      return;
    }


    this.modalMode = 'create';
    this.editingMember = null;
    this.resetModalState();
    this.showMemberModal = true;
  }

  openEditMemberModal(member: EventMember) {
    this.modalMode = 'edit';
    this.editingMember = member;
    this.selectedUser = member.user || null;
    this.selectedRole = member.role;
    this.showMemberModal = true;
  }

  closeMemberModal() {
    this.showMemberModal = false;
    this.resetModalState();
  }

  resetModalState() {
    this.searchEmail = '';
    this.searchResults = [];
    this.selectedUser = null;
    this.selectedRole = 'Lectura';
    this.searchError = '';
    this.isSearching = false;
    this.isSubmitting = false;
  }

  async searchUserByEmail() {
    if (!this.searchEmail?.trim()) {
      this.searchError = 'Ingresa un correo electrónico';
      return;
    }

    if (!/\S+@\S+\.\S+/.test(this.searchEmail)) {
      this.searchError = 'Ingresa un correo electrónico válido';
      return;
    }

    this.isSearching = true;
    this.searchError = '';

    try {
      // Search user by email in user_profiles
      const userData = await this.getUserByEmail(this.searchEmail.trim());
      if (!userData || !userData.profile) {
        this.searchError = 'No se encontró ningún usuario con ese correo. El correo debe estar registrado en Festiva.';
        this.searchResults = [];
        return;
      }

      

      if (userData) {
        // Check if user is already a member
        const isAlreadyMember = this.members.some(member => member.user_id === userData.user.id);
        if (isAlreadyMember) {
          this.searchError = 'Este usuario ya es miembro del evento';
          this.searchResults = [];
          return;
        }

        this.searchResults = [userData.profile];
        this.selectUser(userData.profile);
        console.log('usuario encontrado', this.searchResults);
        this.searchError = '';
      } else {
        this.searchResults = [];
        this.searchError = 'No se encontró ningún usuario con ese correo';
      }

    } catch (error) {
      console.error('Error searching user:', error);
      this.searchError = 'Error al buscar usuario';
      this.searchResults = [];
    } finally {
      this.isSearching = false;
    }
  }

  selectUser(user: UserProfile) {
    this.selectedUser = user;
    this.searchResults = [];
    this.searchEmail = '';
    this.searchError = '';
  }

  removeSelectedUser() {
    this.selectedUser = null;
    this.searchEmail = '';
    this.searchError = '';
  }

  selectRole(role: 'Lectura' | 'Escritura' | 'Admin') {
    this.selectedRole = role;
  }

  async handleSubmit() {
    if (!this.selectedUser) {
      this.searchError = 'Selecciona un usuario';
      return;
    }

    this.isSubmitting = true;

    try {
      if (this.modalMode === 'edit' && this.editingMember) {
        // Update existing member
        const { data, error } = await this.supabaseService.updateRecord<Partial<EventMember>>(
          'event_members',
          this.editingMember.id,
          { role: this.selectedRole }
        );

        if (error) {
          console.error('Error updating member:', error);
          this.showToast('Error al actualizar el miembro', 'error');
          return;
        }

        this.showToast('Miembro actualizado exitosamente', 'success');
        
      } else {
        // Create new member
        const memberData = {
          user_id: this.selectedUser.id,
          event_id: this.eventId,
          role: this.selectedRole,
          created_by: this.user?.id || null
        };

        const { data, error } = await this.supabaseService.createRecord<Partial<EventMember>>(
          'event_members',
          memberData
        );

        if (error) {
          console.error('Error creating member:', error);
          this.showToast('Error al agregar el miembro', 'error');
          return;
        }

        this.showToast('Miembro agregado exitosamente', 'success');
      }

      this.closeMemberModal();
      this.loadMembers(); // Reload members list

    } catch (error) {
      console.error('Error saving member:', error);
      this.showToast('Error al guardar el miembro', 'error');
    } finally {
      this.isSubmitting = false;
    }
  }

  async confirmDelete(memberId: string) {
    const result = await this.alertCtrl.openFestivaAlert('danger', 'Confirmar eliminación', '¿Estás seguro de que deseas eliminar este miembro del evento? Esta acción no se puede deshacer.', true, 'Cancelar', 'Eliminar');
    if(result.action === 'confirm'){
    this.memberToDelete = memberId;
      this.handleDelete();
      return;
    }
  }

  async handleDelete() {
    if (!this.memberToDelete) return;

    try {
      const { error } = await this.supabaseService.deleteRecord('event_members', this.memberToDelete);

      if (error) {
        console.error('Error deleting member:', error);
        this.showToast('Error al eliminar el miembro', 'error');
        return;
      }

      this.showToast('Miembro eliminado exitosamente', 'success');
      this.loadMembers(); // Reload members list
      
    } catch (error) {
      console.error('Error deleting member:', error);
      this.showToast('Error al eliminar el miembro', 'error');
    } finally {
      this.showDeleteConfirm = false;
      this.memberToDelete = null;
    }
  }

  getAdminCount(): number {
    return this.members.filter(member => member.role === 'Admin').length;
  }

  getUniqueRolesCount(): number {
    return new Set(this.members.map(member => member.role)).size;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  getRoleClasses(role: string): string {
    switch (role) {
      case 'Lectura':
        return 'bg-blue-100 text-blue-700';
      case 'Escritura':
        return 'bg-green-100 text-green-700';
      case 'Admin':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  getRoleIcon(role: string): string {
    switch (role) {
      case 'Lectura':
        return 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z';
      case 'Escritura':
        return 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z';
      case 'Admin':
        return 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z';
      default:
        return 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z';
    }
  }

  goBack() {
    // TODO: Implement navigation back
        this.router.navigate(['/events/management'], { state: { event: this.event }, replaceUrl: true });

  }

  showToast(message: string, type: 'success' | 'error' | 'warning' = 'success') {
    // TODO: Implement toast notification
    console.log(`${type.toUpperCase()}: ${message}`);
  }

  async getUserByEmail(email: string) {
    const { data, error } = await this.supabaseService.getSupabase().functions.invoke('find-user-by-email', { body: { email } });
    if (error) return null;
    console.log('usuario encontrado', data);
    return data;
  }

}