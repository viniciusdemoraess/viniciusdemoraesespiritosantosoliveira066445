import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ArtistService } from '../../../core/services/artist.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationBellComponent } from '../../../shared/components/notification-bell/notification-bell.component';
import { Artist, Page } from '../../../core/models';

@Component({
  selector: 'app-artist-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NotificationBellComponent],
  templateUrl: './artist-list.component.html',
  styleUrls: ['./artist-list.component.scss']
})
export class ArtistListComponent implements OnInit {
  Math = Math;
  artists: Artist[] = [];
  loading = false;
  page = 0;
  size = 9;
  totalPages = 0;
  totalElements = 0;
  searchTerm = '';
  sortBy = 'name';
  sortDirection = 'asc';

  showAddModal = false;
  showEditModal = false;
  showDeleteModal = false;
  selectedArtist: Artist | null = null;
  newArtistName = '';
  editArtistName = '';

  constructor(
    private artistService: ArtistService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadArtists();
  }

  loadArtists(): void {
    this.loading = true;
    this.artistService.getAllArtists(
      this.page,
      this.size,
      this.sortBy,
      this.sortDirection,
      this.searchTerm || undefined
    ).subscribe({
      next: (response: Page<Artist>) => {
        this.artists = response.content;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading artists:', error);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.page = 0;
    this.loadArtists();
  }

  onPageChange(newPage: number): void {
    this.page = newPage;
    this.loadArtists();
  }

  onSort(field: string): void {
    if (this.sortBy === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortDirection = 'asc';
    }
    this.loadArtists();
  }

  openAddModal(): void {
    this.newArtistName = '';
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.newArtistName = '';
  }

  createArtist(): void {
    if (!this.newArtistName.trim()) return;

    this.artistService.createArtist(this.newArtistName).subscribe({
      next: () => {
        this.closeAddModal();
        this.loadArtists();
      },
      error: (error) => {
        console.error('Error creating artist:', error);
        alert(error.error?.message || 'Erro ao criar artista');
      }
    });
  }

  openEditModal(artist: Artist): void {
    this.selectedArtist = artist;
    this.editArtistName = artist.name;
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedArtist = null;
    this.editArtistName = '';
  }

  updateArtist(): void {
    if (!this.selectedArtist || !this.editArtistName.trim()) return;

    this.artistService.updateArtist(this.selectedArtist.id, this.editArtistName).subscribe({
      next: () => {
        this.closeEditModal();
        this.loadArtists();
      },
      error: (error) => {
        console.error('Error updating artist:', error);
        alert(error.error?.message || 'Erro ao atualizar artista');
      }
    });
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

    this.artistService.deleteArtist(this.selectedArtist.id).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.loadArtists();
      },
      error: (error) => {
        console.error('Error deleting artist:', error);
        alert(error.error?.message || 'Erro ao deletar artista');
      }
    });
  }

  viewAlbums(artistId: number): void {
    this.router.navigate(['/albums'], { queryParams: { artistId } });
  }

  logout(): void {
    this.authService.logout();
  }
}
