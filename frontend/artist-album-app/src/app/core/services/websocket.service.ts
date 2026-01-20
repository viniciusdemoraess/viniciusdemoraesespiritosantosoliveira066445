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
          const data = JSON.parse(message.body);
          observer.next({
            message: `Novo álbum "${data.title}" cadastrado para ${data.artistName}`,
            type: 'info',
            data
          });
        });

      return () => subscription.unsubscribe();
    });
  }

  isConnected(): boolean {
    return this.connected;
  }
}
