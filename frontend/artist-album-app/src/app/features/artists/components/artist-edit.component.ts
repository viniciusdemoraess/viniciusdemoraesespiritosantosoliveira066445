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

  // New album form
  newAlbumTitle = '';
  newAlbumYear: number | null = null;
  newAlbumGenre = '';
  newAlbumRecordLabel = '';
  newAlbumTotalTracks: number | null = null;
  newAlbumTotalDuration: number | null = null;

  private subscriptions: Subscription[] = [];
  private artistId!: number;

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
  }

  createAlbum(): void {
    if (!this.artist || !this.newAlbumTitle.trim() || this.newAlbumTitle.trim().length < 3) {
      return;
    }

    const newAlbum: any = {
      title: this.newAlbumTitle.trim(),
      releaseYear: this.newAlbumYear || undefined,
      genre: this.newAlbumGenre.trim() || undefined,
      recordLabel: this.newAlbumRecordLabel.trim() || undefined,
      totalTracks: this.newAlbumTotalTracks || undefined,
      totalDurationSeconds: this.newAlbumTotalDuration || undefined,
      artistId: this.artist.id
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

  cancel(): void {
    this.router.navigate(['/artists', this.artistId]);
  }

  goBack(): void {
    this.router.navigate(['/artists']);
  }
}
