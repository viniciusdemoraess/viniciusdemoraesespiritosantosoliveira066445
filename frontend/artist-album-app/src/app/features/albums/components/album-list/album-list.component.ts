import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AlbumService } from '../../../../core/services/album.service';
import { ArtistService } from '../../../../core/services/artist.service';
import { AuthService } from '../../../../core/services/auth.service';
import { WebsocketService } from '../../../../core/services/websocket.service';
import { Album, Artist, Page } from '../../../../core/models';

@Component({
  selector: 'app-album-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './album-list.component.html',
  styleUrl: './album-list.component.scss'
})
export class AlbumListComponent implements OnInit {
  Math = Math;
  albums: Album[] = [];
  artists: Artist[] = [];
  loading = false;
  page = 0;
  size = 8;
  totalPages = 0;
  totalElements = 0;
  searchTerm = '';
  filterArtistId?: number;

  showAddModal = false;
  showUploadModal = false;
  selectedAlbum: Album | null = null;

  newAlbum = {
    title: '',
    releaseYear: new Date().getFullYear(),
    artistId: 0
  };

  selectedFiles: File[] = [];

  constructor(
    private albumService: AlbumService,
    private artistService: ArtistService,
    public authService: AuthService,
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

    this.loadArtists();
    this.loadAlbums();
    this.setupWebSocket();
  }

  setupWebSocket(): void {
    this.websocketService.connect();
    this.websocketService.watchAlbumNotifications().subscribe(album => {
      console.log('New album notification:', album);
      this.loadAlbums();
    });
  }

  loadArtists(): void {
    this.artistService.getAllArtists(0, 100).subscribe({
      next: (response: Page<Artist>) => {
        this.artists = response.content;
      },
      error: (error) => console.error('Error loading artists:', error)
    });
  }

  loadAlbums(): void {
    this.loading = true;
    this.albumService.getAllAlbums(
      this.page,
      this.size,
      'title',
      'asc',
      this.filterArtistId,
      this.searchTerm || undefined
    ).subscribe({
      next: (response: Page<Album>) => {
        this.albums = response.content;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading albums:', error);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.page = 0;
    this.loadAlbums();
  }

  onPageChange(newPage: number): void {
    this.page = newPage;
    this.loadAlbums();
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

    this.albumService.createAlbum(this.newAlbum).subscribe({
      next: () => {
        this.closeAddModal();
        this.loadAlbums();
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

    this.albumService.uploadCovers(this.selectedAlbum.id, this.selectedFiles).subscribe({
      next: () => {
        this.closeUploadModal();
        this.loadAlbums();
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

    this.albumService.deleteAlbum(album.id).subscribe({
      next: () => this.loadAlbums(),
      error: (error) => {
        console.error('Error deleting album:', error);
        alert(error.error?.message || 'Erro ao deletar álbum');
      }
    });
  }

  logout(): void {
    this.websocketService.disconnect();
    this.authService.logout();
  }
}
