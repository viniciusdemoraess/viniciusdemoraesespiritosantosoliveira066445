import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { ArtistFacadeService } from '@core/facades/artist-facade.service';
import { AlbumFacadeService } from '@core/facades/album-facade.service';
import { HeaderComponent } from '@shared/components/header/header.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { Artist } from '@core/models';

@Component({
  selector: 'app-artist-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, PaginationComponent],
  templateUrl: './artist-list.component.html',
  styleUrls: ['./artist-list.component.scss']
})
export class ArtistListComponent implements OnInit, OnDestroy {
  Math = Math;
  artists: Artist[] = [];
  loading = false;
  searchTerm = '';
  sortBy = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Pagination
  currentPage = 0;
  pageSize = 9;
  totalItems = 0;
  totalPages = 0;

  showAddModal = false;
  showDeleteModal = false;
  selectedArtist: Artist | null = null;
  newArtistName = '';
  newArtistType = '';
  newArtistCountry = '';
  newArtistBiography = '';

  private subscriptions: Subscription[] = [];

  constructor(
    private artistFacade: ArtistFacadeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subscribeToData();
    this.loadArtists();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private subscribeToData(): void {
    const artistsSub = this.artistFacade.artists$.subscribe((artists: Artist[]) => {
      this.artists = artists;
    });

    const paginationSub = this.artistFacade.pagination$.subscribe((pagination) => {
      this.totalItems = pagination.totalElements;
      this.totalPages = pagination.totalPages;
      this.currentPage = pagination.currentPage;
    });

    const loadingSub = this.artistFacade.loading$.subscribe((loading: boolean) => {
      this.loading = loading;
    });

    this.subscriptions.push(artistsSub, paginationSub, loadingSub);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadArtists();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get searchInfo(): string | undefined {
    if (this.searchTerm.trim()) {
      return `para "${this.searchTerm}"`;
    }
    return undefined;
  }

  loadArtists(): void {
    this.artistFacade.loadArtists(
      this.currentPage,
      this.pageSize,
      this.sortBy,
      this.sortDirection,
      this.searchTerm.trim() || undefined
    );
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadArtists();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 0;
    this.loadArtists();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.sortDirection = 'asc';
    this.currentPage = 0;
    this.loadArtists();
  }

  get showClearFiltersButton(): boolean {
    return this.searchTerm.trim() !== '' || this.sortDirection !== 'asc';
  }

  toggleSortDirection(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.currentPage = 0;
    this.loadArtists();
  }

  onSort(field: string): void {
    if (this.sortBy === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortDirection = 'asc';
    }
    this.currentPage = 0;
    this.loadArtists();
  }

  openAddModal(): void {
    this.newArtistName = '';
    this.newArtistType = '';
    this.newArtistCountry = '';
    this.newArtistBiography = '';
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.newArtistName = '';
    this.newArtistType = '';
    this.newArtistCountry = '';
    this.newArtistBiography = '';
  }

  createArtist(): void {
    if (!this.newArtistName.trim() || this.newArtistName.trim().length < 3) return;

    const newArtist: Partial<Artist> = {
      name: this.newArtistName.trim()
    };

    if (this.newArtistType.trim()) {
      newArtist.artistType = this.newArtistType.trim();
    }
    if (this.newArtistCountry.trim()) {
      newArtist.country = this.newArtistCountry.trim();
    }
    if (this.newArtistBiography.trim()) {
      newArtist.biography = this.newArtistBiography.trim();
    }

    this.artistFacade.createArtist(newArtist).subscribe({
      next: () => {
        this.closeAddModal();
      },
      error: (error: any) => {
        console.error('Error creating artist:', error);
      }
    });
  }

  openEditModal(artist: Artist): void {
    this.router.navigate(['/artists', artist.id, 'edit']);
  }

  openDeleteModal(artist: Artist): void {
    this.selectedArtist = artist;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedArtist = null;
  }

  deleteArtist(): void {
    if (!this.selectedArtist) return;

    this.artistFacade.deleteArtist(this.selectedArtist.id).subscribe({
      next: () => {
        this.closeDeleteModal();
      },
      error: (error: any) => {
        console.error('Error deleting artist:', error);
      }
    });
  }

  viewAlbums(artistId: number): void {
    this.router.navigate(['/albums'], { queryParams: { artistId } });
  }

  viewArtistDetails(artistId: number): void {
    this.router.navigate(['/artists', artistId]);
  }
}
