import { Injectable } from '@angular/core';
import { Observable, combineLatest, map } from 'rxjs';
import { ArtistFacadeService } from './artist-facade.service';
import { AlbumFacadeService } from './album-facade.service';

/**
 * Dashboard Facade Service
 * Follows Facade Pattern - Composes multiple facades to provide aggregated data
 * Demonstrates Composition over Inheritance principle
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardFacadeService {
  // Aggregated loading state from both facades
  public readonly loading$ = combineLatest([
    this.artistFacade.loading$,
    this.albumFacade.loading$
  ]).pipe(
    map(([artistLoading, albumLoading]) => artistLoading || albumLoading)
  );

  // Aggregated error state
  public readonly error$ = combineLatest([
    this.artistFacade.error$,
    this.albumFacade.error$
  ]).pipe(
    map(([artistError, albumError]) => artistError || albumError)
  );

  /**
   * Derived statistics from both Artist and Album facades
   */
  public readonly stats$ = combineLatest([
    this.artistFacade.artists$,
    this.albumFacade.albums$
  ]).pipe(
    map(([artists, albums]) => ({
      totalArtists: artists.length,
      totalAlbums: albums.length,
      averageAlbumsPerArtist: artists.length > 0
        ? Number((albums.length / artists.length).toFixed(1))
        : 0,
      artistsWithoutAlbums: artists.filter(a => a.albumCount === 0).length,
      albumsWithCovers: albums.filter(a => a.covers.length > 0).length,
      albumsWithoutCovers: albums.filter(a => a.covers.length === 0).length
    }))
  );

  /**
   * Recent albums (top 5 by release year)
   */
  public readonly recentAlbums$ = this.albumFacade.albums$.pipe(
    map(albums =>
      [...albums]
        .sort((a, b) => b.releaseYear - a.releaseYear)
        .slice(0, 5)
        .map(album => ({
          id: album.id,
          title: album.title,
          artistName: album.artistName,
          releaseYear: album.releaseYear
        }))
    )
  );

  constructor(
    private artistFacade: ArtistFacadeService,
    private albumFacade: AlbumFacadeService
  ) {}

  /**
   * Load all dashboard data
   * Delegates to individual facades
   */
  loadAllData(): void {
    this.artistFacade.loadArtists();
    this.albumFacade.loadAlbums();
  }

  /**
   * Get artists observable (passthrough)
   */
  get artists$(): Observable<any[]> {
    return this.artistFacade.artists$;
  }

  /**
   * Get albums observable (passthrough)
   */
  get albums$(): Observable<any[]> {
    return this.albumFacade.albums$;
  }
}
