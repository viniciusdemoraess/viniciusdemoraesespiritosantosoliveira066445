import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { AlbumService } from '@core/services/album.service';
import { Album, Page } from '@core/models';

/**
 * Album Facade Service
 * Follows Single Responsibility Principle - handles only Album-related operations
 * Provides reactive state management for Album entities
 */
@Injectable({
  providedIn: 'root'
})
export class AlbumFacadeService {
  // Private State
  private albumsSubject = new BehaviorSubject<Album[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Public Observables
  public readonly albums$ = this.albumsSubject.asObservable();
  public readonly loading$ = this.loadingSubject.asObservable();
  public readonly error$ = this.errorSubject.asObservable();

  // Derived State
  public readonly totalAlbums$ = this.albums$.pipe(
    map(albums => albums.length)
  );

  public readonly albumsWithCovers$ = this.albums$.pipe(
    map(albums => albums.filter(a => a.covers.length > 0).length)
  );

  public readonly albumsWithoutCovers$ = this.albums$.pipe(
    map(albums => albums.filter(a => a.covers.length === 0).length)
  );

  constructor(private albumService: AlbumService) {}

  /**
   * Load all albums with pagination
   */
  loadAlbums(page: number = 0, size: number = 1000): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.albumService.getAllAlbums(page, size).subscribe({
      next: (response: Page<Album>) => {
        this.albumsSubject.next(response.content);
        this.loadingSubject.next(false);
      },
      error: (error) => {
        this.errorSubject.next('Erro ao carregar álbuns');
        this.loadingSubject.next(false);
        console.error('Error loading albums:', error);
      }
    });
  }


  loadAlbumById(id: number): Observable<Album> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return new Observable(observer => {
      this.albumService.getAlbumById(id).subscribe({
        next: (album: Album) => {
          // Update state: add or update this album
          const current = this.albumsSubject.value;
          const index = current.findIndex(a => a.id === id);
          if (index !== -1) {
            current[index] = album;
            this.albumsSubject.next([...current]);
          } else {
            this.albumsSubject.next([...current, album]);
          }
          
          this.loadingSubject.next(false);
          observer.next(album);
          observer.complete();
        },
        error: (error) => {
          this.errorSubject.next('Erro ao carregar álbum');
          this.loadingSubject.next(false);
          observer.error(error);
          console.error('Error loading album by ID:', error);
        }
      });
    });
  }

  /**
   * Load albums for a specific artist
   */
  loadAlbumsByArtist(artistId: number): Observable<Album[]> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return new Observable(observer => {
      this.albumService.getAllAlbums(0, 1000, 'title', 'asc', artistId).subscribe({
        next: (response: Page<Album>) => {
          const artistAlbums = response.content;
          
          // Update state: remove old albums that have this artist and add new ones
          const current = this.albumsSubject.value;
          const albumIdsToRemove = new Set(artistAlbums.map(a => a.id));
          const filteredCurrent = current.filter(a => !albumIdsToRemove.has(a.id));
          this.albumsSubject.next([...filteredCurrent, ...artistAlbums]);
          
          this.loadingSubject.next(false);
          observer.next(artistAlbums);
          observer.complete();
        },
        error: (error) => {
          this.errorSubject.next('Erro ao carregar álbuns do artista');
          this.loadingSubject.next(false);
          console.error('Error loading artist albums:', error);
          observer.error(error);
        }
      });
    });
  }

  /**
   * Create a new album and update the state
   */
  createAlbum(album: { 
    title: string; 
    releaseYear: number; 
    genre?: string;
    recordLabel?: string;
    totalTracks?: number;
    totalDurationSeconds?: number;
    artistId?: number;  // Legacy support
    artistIds?: number[]; // New N:N support
  }): Observable<Album> {
    return new Observable(observer => {
      this.albumService.createAlbum(album).subscribe({
        next: (newAlbum) => {
          const current = this.albumsSubject.value;
          this.albumsSubject.next([...current, newAlbum]);
          observer.next(newAlbum);
          observer.complete();
        },
        error: (error) => {
          this.errorSubject.next('Erro ao criar álbum');
          observer.error(error);
        }
      });
    });
  }

  /**
   * Update an existing album
   */
  updateAlbum(id: number, album: Partial<Album> & { artistIds?: number[] }): Observable<Album> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    // Prepare update payload with artistIds if present
    const updatePayload: any = {
      title: album.title,
      releaseYear: album.releaseYear,
      genre: album.genre,
      recordLabel: album.recordLabel,
      totalTracks: album.totalTracks,
      totalDurationSeconds: album.totalDurationSeconds
    };

    // Add artistIds if present (for N:N relationship)
    if (album.artistIds && album.artistIds.length > 0) {
      updatePayload.artistIds = album.artistIds;
    }

    return new Observable(observer => {
      this.albumService.updateAlbum(id, updatePayload).subscribe({
        next: (updatedAlbum: Album) => {
          // Update local state
          const current = this.albumsSubject.value;
          const index = current.findIndex(a => a.id === id);
          if (index !== -1) {
            current[index] = updatedAlbum;
            this.albumsSubject.next([...current]);
          }
          
          this.loadingSubject.next(false);
          observer.next(updatedAlbum);
          observer.complete();
        },
        error: (error) => {
          this.errorSubject.next('Erro ao atualizar álbum');
          this.loadingSubject.next(false);
          observer.error(error);
          console.error('Error updating album:', error);
        }
      });
    });
  }

  /**
   * Delete an album
   */
  deleteAlbum(id: number): Observable<void> {
    return new Observable(observer => {
      this.albumService.deleteAlbum(id).subscribe({
        next: () => {
          const current = this.albumsSubject.value;
          this.albumsSubject.next(current.filter(a => a.id !== id));
          observer.next();
          observer.complete();
        },
        error: (error) => {
          this.errorSubject.next('Erro ao deletar álbum');
          observer.error(error);
        }
      });
    });
  }

  /**
   * Upload covers for an album
   * Note: This doesn't update state automatically, call loadAlbums() after if needed
   */
  uploadCovers(albumId: number, files: File[]): Observable<any> {
    return this.albumService.uploadCovers(albumId, files);
  }

  /**
   * Refresh a specific album from the server
   */
  refreshAlbum(albumId: number): void {
    // Could implement getAlbumById in AlbumService if needed
    this.loadAlbums();
  }

  /**
   * Get current albums snapshot (synchronous)
   */
  getAlbumsSnapshot(): Album[] {
    return this.albumsSubject.value;
  }

  /**
   * Filter albums by artist ID
   */
  getAlbumsByArtist$(artistId: number): Observable<Album[]> {
    return this.albums$.pipe(
      map(albums => albums.filter(a => a.artistId === artistId))
    );
  }

  /**
   * Clear all state
   */
  clearState(): void {
    this.albumsSubject.next([]);
    this.loadingSubject.next(false);
    this.errorSubject.next(null);
  }
}
