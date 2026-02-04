import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AlbumFacadeService } from '@core/facades/album-facade.service';
import { HeaderComponent } from '@shared/components/header/header.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { Album } from '@core/models';

@Component({
  selector: 'app-album-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, PaginationComponent],
  templateUrl: './album-list.component.html',
  styleUrl: './album-list.component.scss'
})
export class AlbumListComponent implements OnInit, OnDestroy {
  Math = Math;
  albums: Album[] = [];
  loading = false;
  searchTerm = '';
  filterArtistId?: number;

  // Pagination
  currentPage = 0;
  pageSize = 8;
  totalItems = 0;
  totalPages = 0;

  // Sorting
  sortBy = 'title';
  sortDirection: 'asc' | 'desc' = 'asc';

  private subscriptions: Subscription[] = [];
  private searchSubject = new Subject<string>();

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
    this.setupSearchDebounce();
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private setupSearchDebounce(): void {
    const searchSub = this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.currentPage = 0;
        this.loadData();
      });

    this.subscriptions.push(searchSub);
  }

  private subscribeToData(): void {
    const albumsSub = this.albumFacade.albums$.subscribe((albums: Album[]) => {
      this.albums = albums;
    });

    const paginationSub = this.albumFacade.pagination$.subscribe((pagination) => {
      this.totalItems = pagination.totalElements;
      this.totalPages = pagination.totalPages;
      this.currentPage = pagination.currentPage;
    });

    const loadingSub = this.albumFacade.loading$.subscribe((loading: boolean) => {
      this.loading = loading;
    });

    this.subscriptions.push(albumsSub, paginationSub, loadingSub);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadData();
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

  loadData(): void {
    const sortMap: { [key: string]: string } = {
      'title': 'title',
      'year': 'releaseYear',
      'artist': 'artistName'
    };
    const backendSortBy = sortMap[this.sortBy] || 'title';

    this.albumFacade.loadAlbums(
      this.currentPage,
      this.pageSize,
      backendSortBy,
      this.sortDirection,
      this.searchTerm.trim() || undefined,
      this.filterArtistId
    );
  }

  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 0;
    this.searchSubject.next(this.searchTerm);
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
    this.loadData();
  }

  toggleSortDirection(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.currentPage = 0;
    this.loadData();
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
