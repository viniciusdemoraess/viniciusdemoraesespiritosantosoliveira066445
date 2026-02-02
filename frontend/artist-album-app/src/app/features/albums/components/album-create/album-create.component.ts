import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AlbumFacadeService } from '@core/facades/album-facade.service';
import { ArtistFacadeService } from '@core/facades/artist-facade.service';
import { HeaderComponent } from '@shared/components/header/header.component';
import { Artist } from '@core/models';

@Component({
  selector: 'app-album-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent],
  templateUrl: './album-create.component.html',
  styleUrl: './album-create.component.scss'
})
export class AlbumCreateComponent implements OnInit {
  artists: Artist[] = [];
  loading = false;
  showArtistDropdown = false;

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
    this.loadArtists();
  }

  private loadArtists(): void {
    this.artistFacade.artists$.subscribe((artists: Artist[]) => {
      this.artists = artists;
    });
    this.artistFacade.loadArtists();
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
    // Permite: backspace, delete, tab, escape, enter, home, end, arrows
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'Home', 'End', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];

    if (allowedKeys.includes(event.key)) {
      return;
    }

    // Bloqueia: e, E, +, -, . e outros caracteres não numéricos
    if (event.key === 'e' || event.key === 'E' || event.key === '+' || event.key === '-' || event.key === '.' || event.key === ',') {
      event.preventDefault();
    }

    // Permite apenas números de 0-9
    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }
}
