import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AlbumFacadeService } from '../../../../core/facades/album-facade.service';
import { ArtistFacadeService } from '../../../../core/facades/artist-facade.service';
import { WebsocketService } from '../../../../core/services/websocket.service';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { Album, Artist } from '../../../../core/models';
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
  showUploadModal = false;
  selectedAlbum: Album | null = null;

  newAlbum = {
    title: '',
    releaseYear: new Date().getFullYear(),
    artistId: 0
  };

  selectedFiles: File[] = [];
  private subscriptions: Subscription[] = [];

  constructor(
    private albumFacade: AlbumFacadeService,
    private artistFacade: ArtistFacadeService,
    private websocketService: WebsocketService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['artistId']) {
        this.filterArtistId = +params['artistId'];
      }
    });

    this.subscribeToData();
    this.loadData();
    this.setupWebSocket();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private subscribeToData(): void {
    const albumsSub = this.albumFacade.albums$.subscribe(albums => {
      this.allAlbums = this.filterAlbums(albums);
      this.totalItems = this.allAlbums.length;
      this.applyPagination();
    });

    const artistsSub = this.artistFacade.artists$.subscribe(artists => {
      this.artists = artists;
    });

    const loadingSub = this.albumFacade.loading$.subscribe(loading => {
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

  setupWebSocket(): void {
    this.websocketService.connect();
    const wsSub = this.websocketService.watchAlbumNotifications().subscribe(album => {
      console.log('New album notification:', album);
      this.loadData();
    });
    this.subscriptions.push(wsSub);
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

  setSortBy(field: 'title' | 'year' | 'artist'): void {
    if (this.sortBy === field) {
      this.toggleSortDirection();
    } else {
      this.sortBy = field;
      this.sortDirection = 'asc';
    }
    this.currentPage = 0;
    this.albumFacade.albums$.subscribe(albums => {
      this.allAlbums = this.filterAlbums(albums);
      this.totalItems = this.allAlbums.length;
      this.applyPagination();
    }).unsubscribe();
  }

  toggleSortDirection(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.currentPage = 0;
    this.albumFacade.albums$.subscribe(albums => {
      this.allAlbums = this.filterAlbums(albums);
      this.totalItems = this.allAlbums.length;
      this.applyPagination();
    }).unsubscribe();
  }

  openAddModal(): void {
    this.newAlbum = {
      title: '',
      releaseYear: new Date().getFullYear(),
      artistId: this.artists.length > 0 ? this.artists[0].id : 0
    };
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  createAlbum(): void {
    if (!this.newAlbum.title || !this.newAlbum.artistId) return;

    this.albumFacade.createAlbum(this.newAlbum).subscribe({
      next: () => {
        this.closeAddModal();
      },
      error: (error) => {
        console.error('Error creating album:', error);
        alert(error.error?.message || 'Erro ao criar álbum');
      }
    });
  }

  openUploadModal(album: Album): void {
    this.selectedAlbum = album;
    this.selectedFiles = [];
    this.showUploadModal = true;
  }

  closeUploadModal(): void {
    this.showUploadModal = false;
    this.selectedAlbum = null;
    this.selectedFiles = [];
  }

  onFileSelect(event: any): void {
    const files = event.target.files;
    this.selectedFiles = Array.from(files);
  }

  uploadCovers(): void {
    if (!this.selectedAlbum || this.selectedFiles.length === 0) return;

    this.albumFacade.uploadCovers(this.selectedAlbum.id, this.selectedFiles).subscribe({
      next: () => {
        this.closeUploadModal();
        this.loadData();
        alert('Capas enviadas com sucesso!');
      },
      error: (error) => {
        console.error('Error uploading covers:', error);
        alert(error.error?.message || 'Erro ao enviar capas');
      }
    });
  }

  deleteAlbum(album: Album): void {
    if (!confirm(`Deseja deletar o álbum "${album.title}"?`)) return;

    this.albumFacade.deleteAlbum(album.id).subscribe({
      next: () => {},
      error: (error) => {
        console.error('Error deleting album:', error);
        alert(error.error?.message || 'Erro ao deletar álbum');
      }
    });
  }
}
