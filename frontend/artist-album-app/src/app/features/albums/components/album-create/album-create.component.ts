import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AlbumFacadeService } from '@core/facades/album-facade.service';
import { ArtistFacadeService } from '@core/facades/artist-facade.service';
import { HeaderComponent } from '@shared/components/header/header.component';
import { ClickOutsideDirective } from '@shared/directives/click-outside.directive';
import { Artist } from '@core/models';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-album-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, ClickOutsideDirective],
  templateUrl: './album-create.component.html',
  styleUrl: './album-create.component.scss'
})
export class AlbumCreateComponent implements OnInit, OnDestroy {
  artists: Artist[] = [];
  loading = false;
  showArtistDropdown = false;
  
  // Artist search and pagination
  artistSearchTerm = '';
  private searchSubject = new Subject<string>();
  artistPage = 0;
  artistPageSize = 20;
  hasMoreArtists = true;
  loadingMoreArtists = false;
  private isLoadingRequest = false;
  
  private subscriptions: Subscription[] = [];

  newAlbum = {
    title: '',
    releaseYear: new Date().getFullYear(),
    genre: '',
    recordLabel: '',
    totalTracks: undefined as number | undefined,
    totalDurationSeconds: undefined as number | undefined,
    artistIds: [] as number[]
  };

  selectedArtistIds: Set<number> = new Set();
  coverFiles: File[] = [];
  coverPreviews: string[] = [];

  constructor(
    private albumFacade: AlbumFacadeService,
    private artistFacade: ArtistFacadeService,
    private router: Router
  ) {}

  ngOnInit(): void {
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
  
  get filteredArtists(): Artist[] {
    return this.artists;
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

  createAlbum(): void {
    if (!this.newAlbum.title || this.newAlbum.title.trim().length < 3 || this.selectedArtistIds.size === 0) {
      return;
    }

    this.loading = true;
    this.newAlbum.artistIds = Array.from(this.selectedArtistIds);

    this.albumFacade.createAlbum(this.newAlbum).subscribe({
      next: (createdAlbum: any) => {
        if (this.coverFiles.length > 0) {
          this.albumFacade.uploadCovers(createdAlbum.id, this.coverFiles).subscribe({
            next: () => {
              this.router.navigate(['/albums']);
            },
            error: (error: any) => {
              console.error('Error uploading covers:', error);
              this.router.navigate(['/albums']);
            }
          });
        } else {
          this.router.navigate(['/albums']);
        }
      },
      error: (error: any) => {
        console.error('Error creating album:', error);
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/albums']);
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
