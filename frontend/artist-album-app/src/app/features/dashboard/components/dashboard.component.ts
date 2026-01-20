import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ArtistService } from '../../../core/services/artist.service';
import { AlbumService } from '../../../core/services/album.service';
import { AuthService } from '../../../core/services/auth.service';
import { WebsocketService } from '../../../core/services/websocket.service';
import { ToastService } from '../../../core/services/toast.service';
import { Subscription } from 'rxjs';

interface DashboardStats {
  totalArtists: number;
  totalAlbums: number;
  averageAlbumsPerArtist: number;
  artistsWithoutAlbums: number;
  albumsWithCovers: number;
  albumsWithoutCovers: number;
}

interface RecentAlbum {
  id: number;
  title: string;
  artistName: string;
  releaseYear: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  stats: DashboardStats = {
    totalArtists: 0,
    totalAlbums: 0,
    averageAlbumsPerArtist: 0,
    artistsWithoutAlbums: 0,
    albumsWithCovers: 0,
    albumsWithoutCovers: 0
  };

  recentAlbums: RecentAlbum[] = [];
  loading = true;
  error: string | null = null;

  notifications: string[] = [];
  private subscriptions: Subscription[] = [];

  constructor(
    private artistService: ArtistService,
    private albumService: AlbumService,
    public authService: AuthService,
    private websocketService: WebsocketService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadDashboardData();
    this.subscribeToWebSocket();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadDashboardData() {
    this.loading = true;
    this.error = null;

    Promise.all([
      this.loadArtistsStats(),
      this.loadAlbumsStats(),
      this.loadRecentAlbums()
    ])
      .then(() => {
        this.loading = false;
      })
      .catch((error) => {
        this.error = 'Erro ao carregar dados do dashboard';
        this.loading = false;
        console.error('Dashboard error:', error);
      });
  }

  async loadArtistsStats() {
    const response = await this.artistService.getAllArtists(0, 1000).toPromise();
    if (response) {
      this.stats.totalArtists = response.totalElements;
      this.stats.artistsWithoutAlbums = response.content.filter(a => a.albumCount === 0).length;
    }
  }

  async loadAlbumsStats() {
    const response = await this.albumService.getAllAlbums(0, 1000).toPromise();
    if (response) {
      this.stats.totalAlbums = response.totalElements;
      this.stats.albumsWithCovers = response.content.filter(a => a.covers.length > 0).length;
      this.stats.albumsWithoutCovers = response.content.filter(a => a.covers.length === 0).length;

      if (this.stats.totalArtists > 0) {
        this.stats.averageAlbumsPerArtist = Number((this.stats.totalAlbums / this.stats.totalArtists).toFixed(1));
      }
    }
  }

  async loadRecentAlbums() {
    const response = await this.albumService.getAllAlbums(0, 5, 'releaseYear', 'desc').toPromise();
    if (response) {
      this.recentAlbums = response.content.map(album => ({
        id: album.id,
        title: album.title,
        artistName: album.artistName,
        releaseYear: album.releaseYear
      }));
    }
  }

  subscribeToWebSocket() {
    const sub = this.websocketService.getNotifications().subscribe(
      (message: any) => {
        const notification = `🎵 ${message.message || 'Nova atualização'}`;
        this.showNotification(notification);

        // Show toast notification
        this.toastService.success(notification);

        // Reload stats when something changes
        this.loadDashboardData();
      }
    );
    this.subscriptions.push(sub);
  }

  showNotification(message: string) {
    this.notifications.unshift(message);
    if (this.notifications.length > 5) {
      this.notifications.pop();
    }
  }

  clearNotifications() {
    this.notifications = [];
  }

  retry() {
    this.loadDashboardData();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
