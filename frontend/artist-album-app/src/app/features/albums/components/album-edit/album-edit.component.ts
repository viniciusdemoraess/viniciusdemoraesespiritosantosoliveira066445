import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlbumFacadeService } from '@core/facades/album-facade.service';
import { ArtistFacadeService } from '@core/facades/artist-facade.service';
import { HeaderComponent } from '@shared/components/header/header.component';
import { Album, Artist } from '@core/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-album-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './album-edit.component.html',
  styleUrl: './album-edit.component.scss'
})
export class AlbumEditComponent implements OnInit, OnDestroy {
  album: Album | null = null;
  artists: Artist[] = [];
  loading = false;
  saving = false;

  // Form fields
  albumTitle = '';
  albumReleaseYear = new Date().getFullYear();
  albumGenre = '';
  albumRecordLabel = '';
  albumTotalTracks?: number;
  albumTotalDurationSeconds?: number;

  // Artist selection
  selectedArtistIds: Set<number> = new Set();
  showArtistDropdown = false;

  // Cover files
  coverFiles: File[] = [];
  coverPreviews: string[] = [];

  private subscriptions: Subscription[] = [];

  constructor(
    private albumFacade: AlbumFacadeService,
    private artistFacade: ArtistFacadeService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadAlbum(+id);
    }
    this.loadArtists();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadAlbum(id: number): void {
    this.loading = true;
    const sub = this.albumFacade.loadAlbumById(id).subscribe({
      next: (album: Album) => {
        this.album = album;
        this.populateForm();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading album:', error);
        this.loading = false;
      }
    });
    this.subscriptions.push(sub);
  }

  private loadArtists(): void {
    const sub = this.artistFacade.artists$.subscribe((artists: Artist[]) => {
      this.artists = artists;
    });
    this.subscriptions.push(sub);
    this.artistFacade.loadArtists();
  }

  private populateForm(): void {
    if (!this.album) return;

    this.albumTitle = this.album.title;
    this.albumReleaseYear = this.album.releaseYear;
    this.albumGenre = this.album.genre || '';
    this.albumRecordLabel = this.album.recordLabel || '';
    this.albumTotalTracks = this.album.totalTracks;
    this.albumTotalDurationSeconds = this.album.totalDurationSeconds;

    // Set selected artists
    this.selectedArtistIds.clear();
    if (this.album.artists && this.album.artists.length > 0) {
      this.album.artists.forEach(artist => this.selectedArtistIds.add(artist.id));
    } else if (this.album.artistId) {
      this.selectedArtistIds.add(this.album.artistId);
    }
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

  getSelectedArtists(): Artist[] {
    return this.artists.filter(artist => this.selectedArtistIds.has(artist.id));
  }

  onCoverFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const filesArray = Array.from(input.files);
      this.coverFiles.push(...filesArray);

      // Create previews
      filesArray.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.coverPreviews.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeCoverPreview(index: number): void {
    this.coverPreviews.splice(index, 1);
    this.coverFiles.splice(index, 1);
  }

  saveAlbum(): void {
    if (!this.album || !this.albumTitle || this.albumTitle.trim().length < 3 || this.selectedArtistIds.size === 0) {
      return;
    }

    this.saving = true;

    const updates: Partial<Album> & { artistIds?: number[] } = {
      title: this.albumTitle,
      releaseYear: this.albumReleaseYear,
      genre: this.albumGenre,
      recordLabel: this.albumRecordLabel,
      totalTracks: this.albumTotalTracks,
      totalDurationSeconds: this.albumTotalDurationSeconds,
      artistIds: Array.from(this.selectedArtistIds)
    };

    this.albumFacade.updateAlbum(this.album.id, updates).subscribe({
      next: (updatedAlbum) => {
        // If covers were selected, upload them
        if (this.coverFiles.length > 0) {
          this.albumFacade.uploadCovers(updatedAlbum.id, this.coverFiles).subscribe({
            next: () => {
              this.saving = false;
              this.router.navigate(['/albums']);
            },
            error: (error: any) => {
              console.error('Error uploading covers:', error);
              this.saving = false;
              this.router.navigate(['/albums']);
            }
          });
        } else {
          this.saving = false;
          this.router.navigate(['/albums']);
        }
      },
      error: (error) => {
        console.error('Error updating album:', error);
        this.saving = false;
      }
    });
  }

  cancel(): void {
    this.goBack();
  }

  goBack(): void {
    this.location.back();
  }
}
