import { Component, Input, OnInit, inject } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FestivaEvent } from 'src/app/core/interface/event.interface';
import { Profile } from 'src/app/core/interface/profile.interface';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';

interface EventMember {
  id: string;
  created_at: string;
  user_id: string;
  event_id: string;
  role: 'Lectura' | 'Escritura' | 'Admin';
  user?: Profile;
}



@Component({
  selector: 'app-add-member-modal',
  templateUrl: './add-member-modal.component.html',
  styleUrls: ['./add-member-modal.component.scss'],
  imports: [...StandAloneModules]
})
export class AddMemberModalComponent implements OnInit {
  @Input() modalMode: 'create' | 'edit' = 'create';
  @Input() eventId: string = '';
  @Input() editingMember?: EventMember;
  @Input() members: EventMember[] = [];
  @Input() userId?: string;
  @Input() event?: FestivaEvent;

  // Search state
  searchEmail: string = '';
  searchResults: any[] = [];
  selectedUser: any | null = null;
  selectedRole: 'Lectura' | 'Escritura' | 'Admin' = 'Lectura';

  // Loading states
  isSearching: boolean = false;
  isSubmitting: boolean = false;

  // Error handling
  searchError: string = '';

  private modalController = inject(ModalController);

  constructor(private supabaseService: SupabaseService) { }

  ngOnInit() {
    if (this.modalMode === 'edit' && this.editingMember) {
      this.selectedUser = this.editingMember.user || null;
      this.selectedRole = this.editingMember.role;
    }
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
        const isCurrentUser = userData.user.id === this.userId;
        if (isAlreadyMember) {
          this.searchError = 'Este usuario ya es miembro del evento';
          this.searchResults = [];
          return;
        }

        if (isCurrentUser) {
          this.searchError = 'No puedes agregar a tu propio usuario';
          this.searchResults = [];
          return;
        }

        this.searchResults = [userData.profile];
        this.selectUser(userData.profile);
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

  selectUser(user: Profile) {
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
      let result;

      if (this.modalMode === 'edit' && this.editingMember) {
        // Update existing member
        const { data, error } = await this.supabaseService.updateRecord<Partial<EventMember>>(
          'event_members',
          this.editingMember.id,
          { role: this.selectedRole }
        );

        if (error) {
          console.error('Error updating member:', error);
          this.modalController.dismiss({
            success: false,
            error: 'Error al actualizar el miembro'
          });
          return;
        }

        result = {
          success: true,
          action: 'edit',
          member: { ...this.editingMember, role: this.selectedRole },
          message: 'Miembro actualizado exitosamente'
        };

      } else {
        // Create new member
        const memberData = {
          user_id: this.selectedUser.id,
          event_id: this.eventId,
          role: this.selectedRole,
          created_by: this.userId || null
        };

        const { data, error } = await this.supabaseService.createRecord<Partial<EventMember>>(
          'event_members',
          memberData
        );

        if (error) {
          console.error('Error creating member:', error);
          this.modalController.dismiss({
            success: false,
            error: 'Error al agregar el miembro'
          });
          return;
        }

        result = {
          success: true,
          action: 'create',
          member: data,
          message: 'Miembro agregado exitosamente'
        };
      }

      this.sendNotification(`${this.selectedUser?.full_name} has sido ${this.modalMode === 'edit' ? 'actualizado' : 'agregado'} al evento "${this.event?.name || ''} como ${this.selectedRole}"`);

      this.modalController.dismiss(result);

    } catch (error) {
      console.error('Error saving member:', error);
      this.modalController.dismiss({
        success: false,
        error: 'Error al guardar el miembro'
      });
    } finally {
      this.isSubmitting = false;
    }
  }

  closeModal() {
    this.modalController.dismiss({
      success: false
    });
  }

  async getUserByEmail(email: string) {
    const { data, error } = await this.supabaseService.getSupabase().functions.invoke('find-user-by-email', { body: { email } });
    if (error) return null;
    return data;
  }

  async sendNotification(message: string) {

    if(!this.selectedUser?.push_token?.length) return;

    const { data, error } = await this.supabaseService.sendPushNotification(
      this.selectedUser?.push_token || '',
      this.event?.name || 'Tu evento',
      message,
      '',
      { screen: 'invite-details', inviteId: 'abc-123' }
    );
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'https://cayetano1999.github.io/festiva-app-host/festiva-logo.png';
  }
}