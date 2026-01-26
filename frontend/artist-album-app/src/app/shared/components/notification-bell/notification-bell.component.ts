import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsocketService } from '@core/services/websocket.service';
import { ToastService } from '@core/services/toast.service';
import { AlbumFacadeService } from '@core/facades/album-facade.service';
import { Subscription } from 'rxjs';

interface Notification {
  id: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'album' | 'artist' | 'system';
  albumTitle?: string;
  artistName?: string;
  albumId?: number;
}

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.scss']
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  showDropdown = false;
  private subscription?: Subscription;

  constructor(
    private websocketService: WebsocketService,
    private toastService: ToastService,
    private albumFacade: AlbumFacadeService
  ) {}

  ngOnInit() {
    this.loadNotificationsFromStorage();
    this.subscribeToWebSocket();
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  subscribeToWebSocket() {
    console.log('🔌 Conectando ao WebSocket...');
    this.websocketService.connect();

    this.subscription = this.websocketService.getNotifications().subscribe({
      next: (message: any) => {
        console.log('✅ Notificação recebida:', message);

        const notification: Notification = {
          id: Date.now().toString(),
          message: message.message || 'Nova atualização',
          timestamp: new Date(),
          read: false,
          type: message.type || 'album',
          albumTitle: message.albumTitle,
          artistName: message.artistName,
          albumId: message.albumId
        };

        this.addNotification(notification);

        // Recarregar álbuns automaticamente quando novo álbum for adicionado
        if (message.type === 'album' || message.albumId) {
          console.log('🔄 Recarregando lista de álbuns...');
          this.albumFacade.loadAlbums();
        }

        // Mostrar toast com informações do álbum
        const toastMessage = message.albumTitle && message.artistName
          ? `🎵 Novo álbum: "${message.albumTitle}" - ${message.artistName}`
          : `🎵 ${notification.message}`;

        this.toastService.success(toastMessage);
        console.log('📢 Toast exibido:', toastMessage);
      },
      error: (error) => {
        console.error('❌ Erro no WebSocket:', error);
      }
    });
  }

  addNotification(notification: Notification) {
    this.notifications.unshift(notification);

    // Manter apenas as últimas 10 notificações
    if (this.notifications.length > 10) {
      this.notifications = this.notifications.slice(0, 10);
    }

    this.saveNotificationsToStorage();
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  markAsRead(notification: Notification) {
    notification.read = true;
    this.saveNotificationsToStorage();
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveNotificationsToStorage();
  }

  clearAll() {
    this.notifications = [];
    this.saveNotificationsToStorage();
    this.showDropdown = false;
  }

  private loadNotificationsFromStorage() {
    const stored = localStorage.getItem('notifications');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.notifications = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
      } catch (e) {
        console.error('Error loading notifications:', e);
      }
    }
  }

  private saveNotificationsToStorage() {
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'album': return '🎵';
      case 'artist': return '🎤';
      case 'system': return '⚙️';
      default: return '📢';
    }
  }

  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}min atrás`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;

    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  }
}
