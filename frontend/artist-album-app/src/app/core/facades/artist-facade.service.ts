import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { ArtistService } from '../services/artist.service';
import { Artist, Page } from '../models';

/**
 * Artist Facade Service
 * Follows Single Responsibility Principle - handles only Artist-related operations
 * Provides reactive state management for Artist entities
 */
@Injectable({
  providedIn: 'root'
})
export class ArtistFacadeService {
  // Private State
  private artistsSubject = new BehaviorSubject<Artist[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Public Observables
  public readonly artists$ = this.artistsSubject.asObservable();
  public readonly loading$ = this.loadingSubject.asObservable();
  public readonly error$ = this.errorSubject.asObservable();

  // Derived State
  public readonly totalArtists$ = this.artists$.pipe(
    map(artists => artists.length)
  );

  public readonly artistsWithoutAlbums$ = this.artists$.pipe(
    map(artists => artists.filter(a => a.albumCount === 0).length)
  );

  constructor(private artistService: ArtistService) {}

  /**
   * Load all artists with pagination
   */
  loadArtists(page: number = 0, size: number = 1000): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.artistService.getAllArtists(page, size).subscribe({
      next: (response: Page<Artist>) => {
        this.artistsSubject.next(response.content);
        this.loadingSubject.next(false);
      },
      error: (error) => {
        this.errorSubject.next('Erro ao carregar artistas');
        this.loadingSubject.next(false);
        console.error('Error loading artists:', error);
      }
    });
  }

  /**
   * Create a new artist and update the state
   */
  createArtist(artistData: Partial<Artist> | string): Observable<Artist> {
    // Suporta tanto o formato antigo (string) quanto o novo (objeto)
    const data = typeof artistData === 'string' 
      ? { name: artistData } 
      : artistData;

    return new Observable(observer => {
      this.artistService.createArtist(data).subscribe({
        next: (artist) => {
          const current = this.artistsSubject.value;
          this.artistsSubject.next([...current, artist]);
          observer.next(artist);
          observer.complete();
        },
        error: (error) => {
          this.errorSubject.next('Erro ao criar artista');
          observer.error(error);
        }
      });
    });
  }

  /**
   * Update an existing artist
   */
  updateArtist(id: number, artistData: Partial<Artist> | string): Observable<Artist> {
    // Suporta tanto o formato antigo (string) quanto o novo (objeto)
    const data = typeof artistData === 'string' 
      ? { name: artistData } 
      : artistData;

    return new Observable(observer => {
      this.artistService.updateArtist(id, data).subscribe({
        next: (updatedArtist) => {
          const current = this.artistsSubject.value;
          const index = current.findIndex(a => a.id === id);
          if (index !== -1) {
            current[index] = updatedArtist;
            this.artistsSubject.next([...current]);
          }
          observer.next(updatedArtist);
          observer.complete();
        },
        error: (error) => {
          this.errorSubject.next('Erro ao atualizar artista');
          observer.error(error);
        }
      });
    });
  }

  /**
   * Delete an artist
   */
  deleteArtist(id: number): Observable<void> {
    return new Observable(observer => {
      this.artistService.deleteArtist(id).subscribe({
        next: () => {
          const current = this.artistsSubject.value;
          this.artistsSubject.next(current.filter(a => a.id !== id));
          observer.next();
          observer.complete();
        },
        error: (error) => {
          this.errorSubject.next('Erro ao deletar artista');
          observer.error(error);
        }
      });
    });
  }

  /**
   * Get current artists snapshot (synchronous)
   */
  getArtistsSnapshot(): Artist[] {
    return this.artistsSubject.value;
  }

  /**
   * Clear all state
   */
  clearState(): void {
    this.artistsSubject.next([]);
    this.loadingSubject.next(false);
    this.errorSubject.next(null);
  }
}
