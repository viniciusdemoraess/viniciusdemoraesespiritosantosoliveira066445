import { Injectable } from '@angular/core';
import { RxStomp } from '@stomp/rx-stomp';
import { Observable } from 'rxjs';
import { Album } from '../models';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private rxStomp: RxStomp;
  private connected = false;

  constructor() {
    this.rxStomp = new RxStomp();
  }

  connect(): void {
    if (this.connected) return;

    this.rxStomp.configure({
      brokerURL: 'ws://localhost:8080/ws',
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.rxStomp.activate();
    this.connected = true;
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
