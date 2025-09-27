import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { IonicModule, NavController } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { Router } from '@angular/router';
import { FestivaEvent } from 'src/app/core/interface/event.interface';

interface Message {
  guestName: string;
  guestId: string;
  messageText: string;
  date: string;
}
@Component({
  selector: 'app-messages',
  templateUrl: './messages.page.html',
  styleUrls: ['./messages.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})



export class MessagesPage implements OnInit {
  
  isIos = Capacitor.getPlatform() === 'ios';
  messages: Message[] = [
    {
      "guestName": "-----",
      "guestId": "5f7c4099-5efc-4075-9e63-8eba96693028",
      "messageText": "Cargando....",
      "date": "2025-09-27T19:22:02.378Z"
    },
      {
      "guestName": "-----",
      "guestId": "5f7c4099-5efc-4075-9e63-8eba96693028",
      "messageText": "Cargando....",
      "date": "2025-09-27T19:22:02.378Z"
    },
      {
      "guestName": "-----",
      "guestId": "5f7c4099-5efc-4075-9e63-8eba96693028",
      "messageText": "Cargando....",
      "date": "2025-09-27T19:22:02.378Z"
    },
   
  ];

  private readonly router = inject(Router);
  private readonly supabaseService = inject(SupabaseService);
  event: FestivaEvent | null = null;


  constructor() { }

  ngOnInit() {
    // Aquí podrías cargar los mensajes desde un servicio
    console.log('Messages page initialized');
  }

  async ionViewWillEnter() {
     const state = this.router.getCurrentNavigation()?.extras?.state ?? history.state;
    if (state?.event) this.event = state.event;

    await this.getEventMessages();
    
  }


  async getEventMessages(){
    const {data, error} : any = await this.supabaseService.getRecords('events', ['messages'], 'id', this.event?.id || '', 'created_at');
    console.log('Fetched messages:', data);
    if(error){
      console.error('Error fetching messages:', error);
      return;
    }
    if(data && data.length > 0){
      this.messages = data[0].messages.reverse() as any[] || [];
    }
  }

  /**
   * Obtiene las iniciales del nombre del invitado
   */
  getInitials(guestName: string): string {
    const names = guestName.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  }

  /**
   * Formatea la fecha en formato legible
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    return date.toLocaleDateString('es-ES', options);
  }

  /**
   * Formatea la hora en formato legible
   */
  formatTime(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    
    return date.toLocaleTimeString('es-ES', options);
  }

  /**
   * Obtiene el tiempo relativo (hace X horas, hace X días)
   */
  getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    const intervals = [
      { label: 'año', seconds: 31536000 },
      { label: 'mes', seconds: 2592000 },
      { label: 'día', seconds: 86400 },
      { label: 'hora', seconds: 3600 },
      { label: 'minuto', seconds: 60 }
    ];
    
    for (const interval of intervals) {
      const count = Math.floor(diffInSeconds / interval.seconds);
      if (count > 0) {
        return `hace ${count} ${interval.label}${count > 1 ? 's' : ''}`;
      }
    }
    
    return 'hace un momento';
  }

  /**
   * Carga más mensajes (simulación)
   */
  loadMoreMessages(): void {
    // Aquí implementarías la lógica para cargar más mensajes
    console.log('Loading more messages...');
    
    // Simulación de carga
    setTimeout(() => {
      const newMessages: Message[] = [
        {
          "guestName": "Ana Martínez",
          "guestId": "9e8d7c6b-5a4f-3e2d-1c0b-a98765432109",
          "messageText": "Felicidades por este hermoso día. Que Dios los bendiga siempre.",
          "date": "2025-09-27T16:30:45.789Z"
        }
      ];
      
      this.messages = [...this.messages, ...newMessages];
    }, 1000);
  }

  /**
   * Filtra mensajes por invitado
   */
  filterMessagesByGuest(guestId: string): Message[] {
    return this.messages.filter(message => message.guestId === guestId);
  }

  /**
   * Ordena mensajes por fecha (más reciente primero)
   */
  sortMessagesByDate(): void {
    this.messages.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  /**
   * Obtiene la cantidad de mensajes por invitado
   */
  getMessagesCountByGuest(): { [key: string]: number } {
    const count: { [key: string]: number } = {};
    
    this.messages.forEach(message => {
      const key = `${message.guestName}_${message.guestId}`;
      count[key] = (count[key] || 0) + 1;
    });
    
    return count;
  }

  /**
   * Busca mensajes por texto
   */
  searchMessages(searchTerm: string): Message[] {
    if (!searchTerm.trim()) {
      return this.messages;
    }
    
    const term = searchTerm.toLowerCase();
    return this.messages.filter(message => 
      message.guestName.toLowerCase().includes(term) ||
      message.messageText.toLowerCase().includes(term)
    );
  }

  goBack() {
       this.router.navigate(['/events/management'], { state: { event: this.event }, replaceUrl: true });

  }

  
}