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
  allArtists: Artist[] = [];
  artists: Artist[] = [];
  loading = false;
  searchTerm = '';
  sortBy = 'name';
  sortDirection = 'asc';

  // Pagination
  currentPage = 0;
  pageSize = 9;
  totalItems = 0;

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
      // Apply client-side sorting and filtering
      this.allArtists = this.filterAndSortArtists(artists);
      this.totalItems = this.allArtists.length;
      this.applyPagination();
    });

    const loadingSub = this.artistFacade.loading$.subscribe((loading: boolean) => {
      this.loading = loading;
    });

    this.subscriptions.push(artistsSub, loadingSub);
  }

  private applyPagination(): void {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    this.artists = this.allArtists.slice(start, end);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.applyPagination();
  }

  get searchInfo(): string | undefined {
    if (this.searchTerm.trim()) {
      return `para "${this.searchTerm}"`;
    }
    return undefined;
  }

  private filterAndSortArtists(artists: Artist[]): Artist[] {
    let filtered = [...artists];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(artist =>
        artist.name.toLowerCase().includes(search)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a.name.toLowerCase();
      const bValue = b.name.toLowerCase();
      const comparison = aValue.localeCompare(bValue);
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }

  loadArtists(): void {
    this.artistFacade.loadArtists();
  }

  onSearch(): void {
    // Reset to first page on search
    this.currentPage = 0;
    this.allArtists = this.filterAndSortArtists(this.allArtists);
    this.totalItems = this.allArtists.length;
    this.applyPagination();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 0;
    this.onSearch();
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
    this.artistFacade.artists$.subscribe((artists: Artist[]) => {
      this.allArtists = this.filterAndSortArtists(artists);
      this.totalItems = this.allArtists.length;
      this.applyPagination();
    }).unsubscribe();
  }

  onSort(field: string): void {
    if (this.sortBy === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortDirection = 'asc';
    }
    // Trigger reactive update
    this.subscribeToData();
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
