import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { ArtistService } from '../services/artist.service';
import { Artist, Page } from '../models';
import { ToastService } from '@core/services/toast.service';

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
  private paginationSubject = new BehaviorSubject<{ totalElements: number; totalPages: number; currentPage: number }>(
    { totalElements: 0, totalPages: 0, currentPage: 0 }
  );

  // Public Observables
  public readonly artists$ = this.artistsSubject.asObservable();
  public readonly loading$ = this.loadingSubject.asObservable();
  public readonly error$ = this.errorSubject.asObservable();
  public readonly pagination$ = this.paginationSubject.asObservable();

  // Derived State
  public readonly totalArtists$ = this.artists$.pipe(
    map(artists => artists.length)
  );

  public readonly artistsWithoutAlbums$ = this.artists$.pipe(
    map(artists => artists.filter(a => a.albumCount === 0).length)
  );

  constructor(
    private artistService: ArtistService,
    private toastService: ToastService
  ) {}

  /**
   * Load artists with server-side pagination
   */
  loadArtists(page: number = 0, size: number = 10, sortBy: string = 'name', sortDirection: string = 'asc', searchTerm?: string): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.artistService.getAllArtists(page, size, sortBy, sortDirection, searchTerm).subscribe({
      next: (response: Page<Artist>) => {
        this.artistsSubject.next(response.content);
        this.paginationSubject.next({
          totalElements: response.totalElements,
          totalPages: response.totalPages,
          currentPage: response.number
        });
        this.loadingSubject.next(false);
      },
      error: (error) => {
        this.loadingSubject.next(false);
        console.error('Error loading artists:', error);
      }
    });
  }

  /**
   * Load a single artist by ID
   */
  loadArtistById(id: number): Observable<Artist> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return new Observable(observer => {
      this.artistService.getArtistById(id).subscribe({
        next: (artist) => {
          // Update or add the artist in state
          const current = this.artistsSubject.value;
          const index = current.findIndex(a => a.id === id);
          if (index !== -1) {
            current[index] = artist;
            this.artistsSubject.next([...current]);
          } else {
            this.artistsSubject.next([...current, artist]);
          }
          this.loadingSubject.next(false);
          observer.next(artist);
          observer.complete();
        },
        error: (error) => {
          this.loadingSubject.next(false);
          console.error('Error loading artist:', error);
          observer.error(error);
        }
      });
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
          this.toastService.success('Artista criado com sucesso!');
          observer.next(artist);
          observer.complete();
        },
        error: (error) => {
          const errorMsg = this.extractErrorMessage(error, 'Erro ao criar artista');
          this.errorSubject.next(errorMsg);
          this.toastService.error(errorMsg);
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
          this.toastService.success('Artista atualizado com sucesso!');
          observer.next(updatedArtist);
          observer.complete();
        },
        error: (error) => {
          const errorMsg = this.extractErrorMessage(error, 'Erro ao atualizar artista');
          this.errorSubject.next(errorMsg);
          this.toastService.error(errorMsg);
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
          this.toastService.success('Artista deletado com sucesso!');
          observer.next();
          observer.complete();
        },
        error: (error) => {
          const errorMsg = this.extractErrorMessage(error, 'Erro ao deletar artista');
          this.errorSubject.next(errorMsg);
          this.toastService.error(errorMsg);
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

  /**
   * Extract detailed error message from backend response
   */
  private extractErrorMessage(error: any, defaultMessage: string): string {
    // Para erro 429, retornar apenas a mensagem do backend sem prefixo
    if (error?.status === 429) {
      return error?.error?.message || 'Limite de requisições atingido. Aguarde um momento.';
    }

    if (error?.error?.errors) {
      // Handle validation errors from backend
      const errors = error.error.errors;
      const errorMessages = Object.entries(errors)
        .map(([field, message]) => `${field}: ${message}`)
        .join(', ');
      return errorMessages || defaultMessage;
    }
    if (error?.error?.error) {
      return error.error.error;
    }
    if (error?.message) {
      return error.message;
    }
    return defaultMessage;
  }
}
