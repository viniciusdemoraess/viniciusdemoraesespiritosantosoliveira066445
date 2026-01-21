import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { AlbumService } from '../services/album.service';
import { Album, Page } from '../models';

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

  /**
   * Create a new album and update the state
   */
  createAlbum(album: { title: string; releaseYear: number; artistId: number }): Observable<Album> {
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
  updateAlbum(id: number, album: Partial<Album>): Observable<Album> {
    return new Observable(observer => {
      // Note: Implement updateAlbum in AlbumService if needed
      const current = this.albumsSubject.value;
      const index = current.findIndex(a => a.id === id);
      if (index !== -1) {
        const updated = { ...current[index], ...album };
        current[index] = updated;
        this.albumsSubject.next([...current]);
        observer.next(updated);
        observer.complete();
      } else {
        observer.error(new Error('Album not found'));
      }
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
