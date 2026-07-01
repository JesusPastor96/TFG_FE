import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../core/services/chat.service';
import { AuthService } from '../../../core/services/auth.service';
import { Role } from '../../../core/models/RoleEnum';

interface Mensaje {
  tipo: 'usuario' | 'asistente';
  texto: string;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.scss'
})
export class ChatbotComponent {
  abierto = signal(false);
  cargando = signal(false);
  pregunta = '';
  mensajes = signal<Mensaje[]>([
    { tipo: 'asistente', texto: '¡Hola! Soy el asistente del restaurante. Puedes preguntarme sobre empleados, turnos y mesas.' }
  ]);

  private chatService = inject(ChatService);
  private authService = inject(AuthService);

  // Solo muestra el chatbot si hay token válido
puedeUsarChat = computed(() => {
  const token = this.authService.getToken();
  const rol = this.authService.roleValue;
  return token !== null && rol !== Role.ROLE_ADMIN;
});

  toggleChat() {
    this.abierto.set(!this.abierto());
  }

  enviarMensaje() {
    if (!this.pregunta.trim() || this.cargando()) return;

    const preguntaActual = this.pregunta.trim();
    this.mensajes.update(m => [...m, { tipo: 'usuario', texto: preguntaActual }]);
    this.pregunta = '';
    this.cargando.set(true);

    this.chatService.enviarPregunta(preguntaActual).subscribe({
      next: (data) => {
        this.cargando.set(false);
        this.mensajes.update(m => [...m, { tipo: 'asistente', texto: data.respuesta }]);
      },
      error: () => {
        this.cargando.set(false);
        this.mensajes.update(m => [...m, { 
          tipo: 'asistente', 
          texto: 'Ha ocurrido un error, inténtalo de nuevo.' 
        }]);
      }
    });
  }

  onEnter(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.enviarMensaje();
    }
  }
}