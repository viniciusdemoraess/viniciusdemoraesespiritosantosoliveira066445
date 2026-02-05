import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlbumFacadeService } from '@core/facades/album-facade.service';
import { ArtistFacadeService } from '@core/facades/artist-facade.service';
import { HeaderComponent } from '@shared/components/header/header.component';
import { ClickOutsideDirective } from '@shared/directives/click-outside.directive';
import { Album, Artist } from '@core/models';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-album-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, ClickOutsideDirective],
  templateUrl: './album-edit.component.html',
  styleUrl: './album-edit.component.scss'
})
export class AlbumEditComponent implements OnInit, OnDestroy {
  album: Album | null = null;
  artists: Artist[] = [];
  loading = false;
  saving = false;

  albumTitle = '';
  albumReleaseYear = new Date().getFullYear();
  albumGenre = '';
  albumRecordLabel = '';
  albumTotalTracks?: number;
  albumTotalDurationSeconds?: number;

  selectedArtistIds: Set<number> = new Set();
  showArtistDropdown = false;

  artistSearchTerm = '';
  private searchSubject = new Subject<string>();
  artistPage = 0;
  artistPageSize = 20;
  hasMoreArtists = true;
  loadingMoreArtists = false;
  private isLoadingRequest = false;

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

    const searchSub = this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      this.artistPage = 0;
      this.artists = [];
      this.loadArtists();
    });
    this.subscriptions.push(searchSub);

    const artistsSub = this.artistFacade.artists$.subscribe((artists: Artist[]) => {
      if (this.isLoadingRequest) {
        if (this.artistPage === 0) {
          this.artists = artists;
        } else {
          const existingIds = new Set(this.artists.map(a => a.id));
          const newArtists = artists.filter(a => !existingIds.has(a.id));
          this.artists = [...this.artists, ...newArtists];
        }
        this.loadingMoreArtists = false;
        this.isLoadingRequest = false;
      }
    });
    this.subscriptions.push(artistsSub);

    const paginationSub = this.artistFacade.pagination$.subscribe((pagination) => {
      this.hasMoreArtists = pagination.currentPage < pagination.totalPages - 1;
    });
    this.subscriptions.push(paginationSub);

    this.loadArtists();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  closeArtistDropdown(): void {
    this.showArtistDropdown = false;
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
    if (this.isLoadingRequest) return;

    this.loadingMoreArtists = true;
    this.isLoadingRequest = true;

    this.artistFacade.loadArtists(
      this.artistPage,
      this.artistPageSize,
      'name',
      'asc',
      this.artistSearchTerm.trim() || undefined
    );
  }

  onArtistSearch(): void {
    this.searchSubject.next(this.artistSearchTerm);
  }

  onArtistDropdownScroll(event: Event): void {
    const element = event.target as HTMLElement;
    const threshold = 50;

    if (element.scrollHeight - element.scrollTop - element.clientHeight < threshold) {
      if (this.hasMoreArtists && !this.loadingMoreArtists && !this.isLoadingRequest) {
        this.artistPage++;
        this.loadArtists();
      }
    }
  }

  get filteredArtists(): Artist[] {
    return this.artists;
  }

  private populateForm(): void {
    if (!this.album) return;

    this.albumTitle = this.album.title;
    this.albumReleaseYear = this.album.releaseYear;
    this.albumGenre = this.album.genre || '';
    this.albumRecordLabel = this.album.recordLabel || '';
    this.albumTotalTracks = this.album.totalTracks;
    this.albumTotalDurationSeconds = this.album.totalDurationSeconds;

    this.selectedArtistIds.clear();
    if (this.album.artists && this.album.artists.length > 0) {
      this.album.artists.forEach(artist => this.selectedArtistIds.add(artist.id));
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

    const updateData = {
      title: this.albumTitle,
      releaseYear: this.albumReleaseYear,
      genre: this.albumGenre,
      recordLabel: this.albumRecordLabel,
      totalTracks: this.albumTotalTracks,
      totalDurationSeconds: this.albumTotalDurationSeconds,
      artistIds: Array.from(this.selectedArtistIds)
    };

    this.albumFacade.updateAlbum(this.album.id, updateData).subscribe({
      next: (updatedAlbum: Album) => {
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

  preventNonNumeric(event: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'Home', 'End', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];

    if (allowedKeys.includes(event.key)) {
      return;
    }

    if (event.key === 'e' || event.key === 'E' || event.key === '+' || event.key === '-' || event.key === '.' || event.key === ',') {
      event.preventDefault();
    }

    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }
}
