import { Injectable } from '@angular/core';
import { RxStomp, RxStompState } from '@stomp/rx-stomp';
import { Observable } from 'rxjs';
import { Album } from '@core/models';
import { environment } from '@environments/environment';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private rxStomp: RxStomp;
  private connected = false;

  constructor() {
    this.rxStomp = new RxStomp();
    this.setupConnectionStateLogging();
  }

  private setupConnectionStateLogging(): void {
    this.rxStomp.connectionState$.subscribe((state: RxStompState) => {
      this.connected = state === RxStompState.OPEN;
    });
  }

  private getWebSocketUrl(): string {
    let wsUrl = environment.wsUrl;

    // Se a URL for relativa, construir URL absoluta
    if (wsUrl.startsWith('/')) {
      const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
      const host = window.location.host;
      wsUrl = `${protocol}//${host}${wsUrl}`;
    }

    return wsUrl;
  }

  connect(): void {
    if (this.connected) {
      return;
    }

    const wsUrl = this.getWebSocketUrl();

    this.rxStomp.configure({
      // Use SockJS for better compatibility
      webSocketFactory: () => {
        return new SockJS(wsUrl);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (msg: string) => {
        console.log('')
      }
    });

    this.rxStomp.activate();
  }

  disconnect(): void {
    if (!this.connected) return;

    this.rxStomp.deactivate();
    this.connected = false;
  }

  watchAlbumNotifications(): Observable<Album> {
    return new Observable(observer => {
      const subscription = this.rxStomp
        .watch('/topic/albums')
        .subscribe(message => {
          const album: Album = JSON.parse(message.body);
          observer.next(album);
        });

      return () => subscription.unsubscribe();
    });
  }

  getNotifications(): Observable<any> {
    return new Observable(observer => {
      const subscription = this.rxStomp
        .watch('/topic/albums')
        .subscribe(message => {
          try {
            const data = JSON.parse(message.body);

            observer.next({
              message: data.message || `Novo álbum "${data.albumTitle}" cadastrado para ${data.artistName}`,
              type: 'album',
              albumId: data.albumId,
              albumTitle: data.albumTitle,
              artistId: data.artistId,
              artistName: data.artistName,
              timestamp: data.timestamp,
              data
            });
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        });

      return () => subscription.unsubscribe();
    });
  }

  isConnected(): boolean {
    return this.connected;
  }
}
