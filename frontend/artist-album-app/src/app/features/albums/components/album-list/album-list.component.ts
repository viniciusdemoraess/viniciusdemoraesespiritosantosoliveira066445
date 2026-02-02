import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AlbumFacadeService } from '@core/facades/album-facade.service';
import { ArtistFacadeService } from '@core/facades/artist-facade.service';
import { HeaderComponent } from '@shared/components/header/header.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { Album, Artist } from '@core/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-album-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, PaginationComponent],
  templateUrl: './album-list.component.html',
  styleUrl: './album-list.component.scss'
})
export class AlbumListComponent implements OnInit, OnDestroy {
  Math = Math;
  allAlbums: Album[] = [];
  albums: Album[] = [];
  artists: Artist[] = [];
  loading = false;
  searchTerm = '';
  filterArtistId?: number;

  // Pagination
  currentPage = 0;
  pageSize = 8;
  totalItems = 0;

  // Sorting
  sortBy = 'title';
  sortDirection: 'asc' | 'desc' = 'asc';

  showAddModal = false;
  showArtistDropdown = false;

  newAlbum = {
    title: '',
    releaseYear: new Date().getFullYear(),
    genre: '',
    recordLabel: '',
    totalTracks: undefined as number | undefined,
    totalDurationSeconds: undefined as number | undefined,
    artistIds: [] as number[]
  };

  // Track selected artists for multi-select
  selectedArtistIds: Set<number> = new Set();

  // Cover files and previews for new album
  newAlbumCoverFiles: File[] = [];
  newAlbumCoverPreviews: string[] = [];
  private subscriptions: Subscription[] = [];

  constructor(
    private albumFacade: AlbumFacadeService,
    private artistFacade: ArtistFacadeService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: any) => {
      if (params['artistId']) {
        this.filterArtistId = +params['artistId'];
      }
    });

    this.subscribeToData();
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private subscribeToData(): void {
    const albumsSub = this.albumFacade.albums$.subscribe((albums: Album[]) => {
      this.allAlbums = this.filterAlbums(albums);
      this.totalItems = this.allAlbums.length;
      this.applyPagination();
    });

    const artistsSub = this.artistFacade.artists$.subscribe((artists: Artist[]) => {
      this.artists = artists;
    });

    const loadingSub = this.albumFacade.loading$.subscribe((loading: boolean) => {
      this.loading = loading;
    });

    this.subscriptions.push(albumsSub, artistsSub, loadingSub);
  }

  private applyPagination(): void {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    this.albums = this.allAlbums.slice(start, end);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.applyPagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get searchInfo(): string | undefined {
    const parts: string[] = [];
    if (this.searchTerm.trim()) {
      parts.push(`para "${this.searchTerm}"`);
    }
    if (this.filterArtistId) {
      parts.push('(filtrado por artista)');
    }
    return parts.length > 0 ? parts.join(' ') : undefined;
  }

  private filterAlbums(albums: Album[]): Album[] {
    let filtered = [...albums];

    // Apply artist filter
    if (this.filterArtistId) {
      filtered = filtered.filter(album => album.artistId === this.filterArtistId);
    }

    // Apply search filter
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(album =>
        album.title.toLowerCase().includes(search) ||
        album.artistName.toLowerCase().includes(search)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (this.sortBy) {
        case 'title':
          comparison = a.title.toLowerCase().localeCompare(b.title.toLowerCase());
          break;
        case 'year':
          comparison = a.releaseYear - b.releaseYear;
          break;
        case 'artist':
          comparison = a.artistName.toLowerCase().localeCompare(b.artistName.toLowerCase());
          break;
      }

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }

  loadData(): void {
    this.albumFacade.loadAlbums();
    this.artistFacade.loadArtists();
  }

  onSearch(): void {
    // Reset to first page on search
    this.currentPage = 0;
    this.allAlbums = this.filterAlbums(this.allAlbums);
    this.totalItems = this.allAlbums.length;
    this.applyPagination();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 0;
    this.onSearch();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filterArtistId = undefined;
    this.sortBy = 'title';
    this.sortDirection = 'asc';
    this.currentPage = 0;
    this.loadData();
  }

  get showClearFiltersButton(): boolean {
    return this.hasActiveFilters();
  }

  hasActiveFilters(): boolean {
    const hasSearch = this.searchTerm.trim() !== '';
    const hasArtistFilter = this.filterArtistId !== undefined;
    const hasNonDefaultSort = this.sortBy !== 'title' || this.sortDirection !== 'asc';

    return hasSearch || hasArtistFilter || hasNonDefaultSort;
  }

  setSortBy(field: 'title' | 'year' | 'artist'): void {
    if (this.sortBy === field) {
      this.toggleSortDirection();
    } else {
      this.sortBy = field;
      this.sortDirection = 'asc';
    }
    this.currentPage = 0;
    this.albumFacade.albums$.subscribe((albums: Album[]) => {
      this.allAlbums = this.filterAlbums(albums);
      this.totalItems = this.allAlbums.length;
      this.applyPagination();
    }).unsubscribe();
  }

  toggleSortDirection(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.currentPage = 0;
    this.albumFacade.albums$.subscribe((albums: Album[]) => {
      this.allAlbums = this.filterAlbums(albums);
      this.totalItems = this.allAlbums.length;
      this.applyPagination();
    }).unsubscribe();
  }

  openAddModal(): void {
    this.newAlbum = {
      title: '',
      releaseYear: new Date().getFullYear(),
      genre: '',
      recordLabel: '',
      totalTracks: undefined,
      totalDurationSeconds: undefined,
      artistIds: []
    };
    this.selectedArtistIds.clear();
    this.showArtistDropdown = false;
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.showArtistDropdown = false;
    this.newAlbumCoverFiles = [];
    this.newAlbumCoverPreviews = [];
  }

  toggleArtistSelection(artistId: number): void {
    if (this.selectedArtistIds.has(artistId)) {
      this.selectedArtistIds.delete(artistId);
    } else {
      this.selectedArtistIds.add(artistId);
    }
  }

  isArtistSelected(artistId: number): boolean {
    return this.selectedArtistIds.has(artistId);
  }

  createAlbum(): void {
    if (!this.newAlbum.title || this.newAlbum.title.trim().length < 3 || this.selectedArtistIds.size === 0) return;

    // Convert Set to Array
    this.newAlbum.artistIds = Array.from(this.selectedArtistIds);

    this.albumFacade.createAlbum(this.newAlbum).subscribe({
      next: (createdAlbum) => {
        // If covers were selected, upload them
        if (this.newAlbumCoverFiles.length > 0) {
          this.albumFacade.uploadCovers(createdAlbum.id, this.newAlbumCoverFiles).subscribe({
            next: () => {
              this.closeAddModal();
              this.loadData();
            },
            error: (error: any) => {
              console.error('Error uploading covers:', error);
              // Album was created, just close modal
              this.closeAddModal();
              this.loadData();
            }
          });
        } else {
          this.closeAddModal();
          this.loadData();
        }
      },
      error: (error) => {
        console.error('Error creating album:', error);
      }
    });
  }

  onCoverFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const filesArray = Array.from(input.files);
      this.newAlbumCoverFiles.push(...filesArray);

      // Create previews
      filesArray.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.newAlbumCoverPreviews.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeCoverPreview(index: number): void {
    this.newAlbumCoverPreviews.splice(index, 1);
    this.newAlbumCoverFiles.splice(index, 1);
  }

  editAlbum(album: Album): void {
    this.router.navigate(['/albums', album.id, 'edit']);
  }

  deleteAlbum(album: Album): void {
    if (!confirm(`Tem certeza que deseja deletar o álbum "${album.title}"?`)) return;

    this.albumFacade.deleteAlbum(album.id).subscribe({
      next: () => {},
      error: (error: any) => {
        console.error('Error deleting album:', error);
      }
    });
  }


}
