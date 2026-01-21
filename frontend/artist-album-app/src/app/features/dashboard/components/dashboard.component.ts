import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DashboardFacadeService } from '../../../core/facades/dashboard-facade.service';
import { AuthService } from '../../../core/services/auth.service';
import { WebsocketService } from '../../../core/services/websocket.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
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
  imports: [CommonModule, RouterModule, HeaderComponent],
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
    private dashboardFacade: DashboardFacadeService,
    public authService: AuthService,
    private websocketService: WebsocketService,
    private router: Router
  ) {}

  ngOnInit() {
    this.subscribeToStats();
    this.loadDashboardData();
    this.subscribeToWebSocket();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Subscribe to reactive stats from DashboardFacadeService
   */
  private subscribeToStats() {
    const statsSub = this.dashboardFacade.stats$.subscribe(stats => {
      this.stats = stats;
    });

    const loadingSub = this.dashboardFacade.loading$.subscribe(loading => {
      this.loading = loading;
    });

    const errorSub = this.dashboardFacade.error$.subscribe(error => {
      this.error = error;
    });

    const recentAlbumsSub = this.dashboardFacade.recentAlbums$.subscribe(albums => {
      this.recentAlbums = albums;
    });

    this.subscriptions.push(statsSub, loadingSub, errorSub, recentAlbumsSub);
  }

  loadDashboardData() {
    this.dashboardFacade.loadAllData();
  }

  subscribeToWebSocket() {
    const sub = this.websocketService.getNotifications().subscribe(
      (message: any) => {
        const notification = `🎵 ${message.message || 'Nova atualização'}`;
        this.showNotification(notification);

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
