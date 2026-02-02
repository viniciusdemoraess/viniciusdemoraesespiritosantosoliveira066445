import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AlbumFacadeService } from '@core/facades/album-facade.service';
import { HeaderComponent } from '@shared/components/header/header.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { Album } from '@core/models';
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

  private subscriptions: Subscription[] = [];

  constructor(
    private albumFacade: AlbumFacadeService,
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

    const loadingSub = this.albumFacade.loading$.subscribe((loading: boolean) => {
      this.loading = loading;
    });

    this.subscriptions.push(albumsSub, loadingSub);
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
    this.router.navigate(['/albums/create']);
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
