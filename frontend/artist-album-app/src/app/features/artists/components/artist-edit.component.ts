import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { ArtistFacadeService } from '@core/facades/artist-facade.service';
import { AlbumFacadeService } from '@core/facades/album-facade.service';
import { HeaderComponent } from '@shared/components/header/header.component';
import { Artist, Album } from '@core/models';

@Component({
  selector: 'app-artist-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent],
  templateUrl: './artist-edit.component.html',
  styleUrls: ['./artist-edit.component.scss']
})
export class ArtistEditComponent implements OnInit, OnDestroy {
  Math = Math;
  artist: Artist | null = null;
  albums: Album[] = [];
  loading = false;
  saving = false;
  
  // Artist form fields
  artistName = '';
  artistType = '';
  artistCountry = '';
  artistBiography = '';

  // Album management
  expandedAlbumIds: Set<number> = new Set();
  currentCoverIndexMap: Map<number, number> = new Map();
  showAddAlbumForm = false;

  // Available artists for multi-select
  allArtists: Artist[] = [];
  selectedNewAlbumArtistIds: Set<number> = new Set();
  showNewAlbumArtistDropdown = false;

  // New album form
  newAlbumTitle = '';
  newAlbumYear: number | null = null;
  newAlbumGenre = '';
  newAlbumRecordLabel = '';
  newAlbumTotalTracks: number | null = null;
  newAlbumTotalDuration: number | null = null;
  newAlbumCoverFiles: File[] = [];
  newAlbumCoverPreviews: string[] = [];

  // Edit album state
  editingAlbumId: number | null = null;
  editAlbumTitle = '';
  editAlbumYear: number | null = null;
  editAlbumGenre = '';
  editAlbumRecordLabel = '';
  editAlbumTotalTracks: number | null = null;
  editAlbumTotalDuration: number | null = null;
  editAlbumCoverFiles: File[] = [];
  editAlbumCoverPreviews: string[] = [];

  private subscriptions: Subscription[] = [];
  artistId!: number; // Public para usar no template

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private artistFacade: ArtistFacadeService,
    private albumFacade: AlbumFacadeService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.artistId = +params['id'];
      this.loadArtistData();
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadArtistData(): void {
    this.loading = true;

    // Load artist
    this.artistFacade.loadArtists();
    const artistSub = this.artistFacade.artists$.subscribe(artists => {
      this.allArtists = artists; // Store all artists for multi-select
      this.artist = artists.find(a => a.id === this.artistId) || null;
      if (this.artist) {
        this.artistName = this.artist.name;
        this.artistType = this.artist.artistType || '';
        this.artistCountry = this.artist.country || '';
        this.artistBiography = this.artist.biography || '';
      }
    });
    this.subscriptions.push(artistSub);

    // Load albums
    this.albumFacade.loadAlbums();
    const albumSub = this.albumFacade.albums$.subscribe(albums => {
      this.albums = albums.filter(a => a.artistId === this.artistId);
      // Initialize cover index for each album
      this.albums.forEach(album => {
        if (!this.currentCoverIndexMap.has(album.id)) {
          this.currentCoverIndexMap.set(album.id, 0);
        }
      });
      this.loading = false;
    });
    this.subscriptions.push(albumSub);
  }

  saveArtist(): void {
    if (!this.artist || !this.artistName.trim() || this.artistName.trim().length < 3) {
      return;
    }

    this.saving = true;
    const updateData = {
      name: this.artistName.trim(),
      artistType: this.artistType.trim() || undefined,
      country: this.artistCountry.trim() || undefined,
      biography: this.artistBiography.trim() || undefined
    };

    this.artistFacade.updateArtist(this.artist.id, updateData).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/artists', this.artistId]);
      },
      error: (error: any) => {
        console.error('Error updating artist:', error);
        this.saving = false;
      }
    });
  }

  toggleAlbum(albumId: number): void {
    if (this.expandedAlbumIds.has(albumId)) {
      this.expandedAlbumIds.delete(albumId);
    } else {
      this.expandedAlbumIds.add(albumId);
    }
  }

  isAlbumExpanded(albumId: number): boolean {
    return this.expandedAlbumIds.has(albumId);
  }

  getCurrentCoverIndex(albumId: number): number {
    return this.currentCoverIndexMap.get(albumId) || 0;
  }

  nextCover(album: Album, event: Event): void {
    event.stopPropagation();
    if (!album.covers || album.covers.length <= 1) return;
    
    const currentIndex = this.getCurrentCoverIndex(album.id);
    const nextIndex = (currentIndex + 1) % album.covers.length;
    this.currentCoverIndexMap.set(album.id, nextIndex);
  }

  previousCover(album: Album, event: Event): void {
    event.stopPropagation();
    if (!album.covers || album.covers.length <= 1) return;
    
    const currentIndex = this.getCurrentCoverIndex(album.id);
    const previousIndex = currentIndex === 0 ? album.covers.length - 1 : currentIndex - 1;
    this.currentCoverIndexMap.set(album.id, previousIndex);
  }

  getCurrentCover(album: Album): string | null {
    if (!album.covers || album.covers.length === 0) return null;
    const index = this.getCurrentCoverIndex(album.id);
    return album.covers[index]?.url || null;
  }

  getMainCover(album: Album): string | null {
    if (!album.covers || album.covers.length === 0) return null;
    return album.covers[0]?.url || null;
  }

  toggleAddAlbumForm(): void {
    this.showAddAlbumForm = !this.showAddAlbumForm;
    if (this.showAddAlbumForm) {
      this.resetNewAlbumForm();
    }
  }

  resetNewAlbumForm(): void {
    this.newAlbumTitle = '';
    this.newAlbumYear = new Date().getFullYear();
    this.newAlbumGenre = '';
    this.newAlbumRecordLabel = '';
    this.newAlbumTotalTracks = null;
    this.newAlbumTotalDuration = null;
    this.newAlbumCoverFiles = [];
    this.newAlbumCoverPreviews = [];
    this.selectedNewAlbumArtistIds.clear();
    // Pre-select current artist
    if (this.artist) {
      this.selectedNewAlbumArtistIds.add(this.artist.id);
    }
  }

  onCoverFileSelected(event: Event, isEditMode = false): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    const validFiles: File[] = [];
    const previews: string[] = [];

    let invalidFiles = 0;

    files.forEach(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        invalidFiles++;
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        invalidFiles++;
        return;
      }

      validFiles.push(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        previews.push(e.target.result);
        
        // Update arrays when all files are read
        if (previews.length === validFiles.length) {
          if (isEditMode) {
            this.editAlbumCoverFiles.push(...validFiles);
            this.editAlbumCoverPreviews.push(...previews);
          } else {
            this.newAlbumCoverFiles.push(...validFiles);
            this.newAlbumCoverPreviews.push(...previews);
          }
        }
      };
      reader.readAsDataURL(file);
    });

    if (invalidFiles > 0) {
      alert(`${invalidFiles} arquivo(s) inválido(s). Apenas imagens de até 5MB são aceitas.`);
    }

    // Reset input
    input.value = '';
  }

  removeCoverPreview(index: number, isEditMode = false): void {
    if (isEditMode) {
      this.editAlbumCoverFiles.splice(index, 1);
      this.editAlbumCoverPreviews.splice(index, 1);
    } else {
      this.newAlbumCoverFiles.splice(index, 1);
      this.newAlbumCoverPreviews.splice(index, 1);
    }
  }

  toggleNewAlbumArtistSelection(artistId: number): void {
    if (this.selectedNewAlbumArtistIds.has(artistId)) {
      this.selectedNewAlbumArtistIds.delete(artistId);
    } else {
      this.selectedNewAlbumArtistIds.add(artistId);
    }
  }

  isNewAlbumArtistSelected(artistId: number): boolean {
    return this.selectedNewAlbumArtistIds.has(artistId);
  }

  createAlbum(): void {
    if (!this.artist || !this.newAlbumTitle.trim() || this.newAlbumTitle.trim().length < 3 || this.selectedNewAlbumArtistIds.size === 0) {
      return;
    }

    const newAlbum: any = {
      title: this.newAlbumTitle.trim(),
      releaseYear: this.newAlbumYear || undefined,
      genre: this.newAlbumGenre.trim() || undefined,
      recordLabel: this.newAlbumRecordLabel.trim() || undefined,
      totalTracks: this.newAlbumTotalTracks || undefined,
      totalDurationSeconds: this.newAlbumTotalDuration || undefined,
      artistIds: Array.from(this.selectedNewAlbumArtistIds)
    };

    this.albumFacade.createAlbum(newAlbum).subscribe({
      next: () => {
        this.showAddAlbumForm = false;
        this.resetNewAlbumForm();
        this.loadArtistData();
      },
      error: (error: any) => {
        console.error('Error creating album:', error);
      }
    });
  }

  // Edit album methods
  startEditAlbum(album: Album): void {
    this.editingAlbumId = album.id;
    this.editAlbumTitle = album.title;
    this.editAlbumYear = album.releaseYear ?? null;
    this.editAlbumGenre = album.genre ?? '';
    this.editAlbumRecordLabel = album.recordLabel ?? '';
    this.editAlbumTotalTracks = album.totalTracks ?? null;
    this.editAlbumTotalDuration = album.totalDurationSeconds ?? null;
  }

  isEditingAlbum(albumId: number): boolean {
    return this.editingAlbumId === albumId;
  }

  saveEditAlbum(album: Album): void {
    if (!this.editAlbumTitle.trim() || this.editAlbumTitle.trim().length < 3) {
      return;
    }

    const updatedAlbum = {
      ...album,
      title: this.editAlbumTitle.trim(),
      releaseYear: this.editAlbumYear ?? undefined,
      genre: this.editAlbumGenre.trim() || undefined,
      recordLabel: this.editAlbumRecordLabel.trim() || undefined,
      totalTracks: this.editAlbumTotalTracks ?? undefined,
      totalDurationSeconds: this.editAlbumTotalDuration ?? undefined
    };

    this.albumFacade.updateAlbum(album.id, updatedAlbum).subscribe({
      next: () => {
        this.cancelEditAlbum();
        this.loadArtistData();
      },
      error: (error: any) => {
        console.error('Error updating album:', error);
      }
    });
  }

  cancelEditAlbum(): void {
    this.editingAlbumId = null;
    this.editAlbumTitle = '';
    this.editAlbumYear = null;
    this.editAlbumGenre = '';
    this.editAlbumRecordLabel = '';
    this.editAlbumTotalTracks = null;
    this.editAlbumTotalDuration = null;
    this.editAlbumCoverFiles = [];
    this.editAlbumCoverPreviews = [];
  }

  deleteAlbum(album: Album): void {
    if (!confirm(`Tem certeza que deseja excluir o álbum "${album.title}"?`)) {
      return;
    }

    this.albumFacade.deleteAlbum(album.id).subscribe({
      next: () => {
        this.loadArtistData();
      },
      error: (error: any) => {
        console.error('Error deleting album:', error);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/artists', this.artistId]);
  }

  goBack(): void {
    this.router.navigate(['/artists']);
  }
}
