import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { ArtistFacadeService } from '@core/facades/artist-facade.service';
import { AlbumFacadeService } from '@core/facades/album-facade.service';
import { HeaderComponent } from '@shared/components/header/header.component';
import { Artist, Album } from '@core/models';

@Component({
  selector: 'app-artist-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './artist-detail.component.html',
  styleUrls: ['./artist-detail.component.scss']
})
export class ArtistDetailComponent implements OnInit, OnDestroy {
  Math = Math;
  artist: Artist | null = null;
  albums: Album[] = [];
  loading = false;
  expandedAlbumIds: Set<number> = new Set();
  currentCoverIndexMap: Map<number, number> = new Map();
  
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
      this.loadArtistDetails();
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadArtistDetails(): void {
    this.loading = true;

    // Load artist
    this.artistFacade.loadArtists();
    const artistSub = this.artistFacade.artists$.subscribe(artists => {
      this.artist = artists.find(a => a.id === this.artistId) || null;
    });
    this.subscriptions.push(artistSub);

    // Load albums for this artist
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
    if (!album.covers || album.covers.length === 0) return;
    
    const currentIndex = this.getCurrentCoverIndex(album.id);
    const nextIndex = (currentIndex + 1) % album.covers.length;
    this.currentCoverIndexMap.set(album.id, nextIndex);
  }

  previousCover(album: Album, event: Event): void {
    event.stopPropagation();
    if (!album.covers || album.covers.length === 0) return;
    
    const currentIndex = this.getCurrentCoverIndex(album.id);
    const previousIndex = currentIndex === 0 ? album.covers.length - 1 : currentIndex - 1;
    this.currentCoverIndexMap.set(album.id, previousIndex);
  }

  getCurrentCover(album: Album): string | null {
    if (!album.covers || album.covers.length === 0) return null;
    const index = this.getCurrentCoverIndex(album.id);
    return album.covers[index]?.url || null;
  }

  goBack(): void {
    this.router.navigate(['/artists']);
  }

  editArtist(): void {
    this.router.navigate(['/artists', this.artistId, 'edit']);
  }
}
