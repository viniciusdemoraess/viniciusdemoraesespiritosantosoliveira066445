import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DashboardService, DashboardStats, RecentAlbum } from '@core/services/dashboard.service';

interface DashboardStatsState {
  totalArtists: number;
  totalAlbums: number;
  averageAlbumsPerArtist: number;
  artistsWithoutAlbums: number;
  albumsWithCovers: number;
  albumsWithoutCovers: number;
}

/**
 * Dashboard Facade Service
 * Uses dedicated dashboard endpoint for efficient statistics retrieval
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardFacadeService {
  // Private State
  private statsSubject = new BehaviorSubject<DashboardStatsState>({
    totalArtists: 0,
    totalAlbums: 0,
    averageAlbumsPerArtist: 0,
    artistsWithoutAlbums: 0,
    albumsWithCovers: 0,
    albumsWithoutCovers: 0
  });

  private recentAlbumsSubject = new BehaviorSubject<RecentAlbum[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Public Observables
  public readonly stats$ = this.statsSubject.asObservable();
  public readonly recentAlbums$ = this.recentAlbumsSubject.asObservable();
  public readonly loading$ = this.loadingSubject.asObservable();
  public readonly error$ = this.errorSubject.asObservable();

  constructor(private dashboardService: DashboardService) {}

  /**
   * Load all dashboard data from dedicated endpoint
   */
  loadAllData(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.dashboardService.getDashboardStats().subscribe({
      next: (data: DashboardStats) => {
        this.statsSubject.next({
          totalArtists: data.totalArtists,
          totalAlbums: data.totalAlbums,
          averageAlbumsPerArtist: data.averageAlbumsPerArtist,
          artistsWithoutAlbums: data.artistsWithoutAlbums,
          albumsWithCovers: data.albumsWithCovers,
          albumsWithoutCovers: data.albumsWithoutCovers
        });
        this.recentAlbumsSubject.next(data.recentAlbums);
        this.loadingSubject.next(false);
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        this.errorSubject.next('Erro ao carregar estatísticas');
        this.loadingSubject.next(false);
      }
    });
  }
}
