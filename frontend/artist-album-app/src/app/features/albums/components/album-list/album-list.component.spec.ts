import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AlbumListComponent } from '@features/albums/components/album-list/album-list.component';
import { AlbumFacadeService } from '@core/facades/album-facade.service';
import { ArtistFacadeService } from '@core/facades/artist-facade.service';
import { Router, ActivatedRoute } from '@angular/router';
import { of, BehaviorSubject } from 'rxjs';
import { Album, Artist } from '@core/models';

describe('AlbumListComponent', () => {
  let component: AlbumListComponent;
  let fixture: ComponentFixture<AlbumListComponent>;
  let albumFacadeService: jasmine.SpyObj<AlbumFacadeService>;
  let artistFacadeService: jasmine.SpyObj<ArtistFacadeService>;

  const mockAlbums: Album[] = [
    {
      id: 1,
      title: 'Album 1',
      releaseYear: 2024,
      artistId: 1,
      artistName: 'Artist 1',
      covers: [],
      createdAt: '2024-01-01T00:00:00',
      updatedAt: '2024-01-01T00:00:00'
    }
  ];

  const mockArtists: Artist[] = [
    { id: 1, name: 'Artist 1', albumCount: 1, createdAt: '2024-01-01T00:00:00', updatedAt: '2024-01-01T00:00:00' }
  ];

  beforeEach(async () => {
    const albumsSubject = new BehaviorSubject<Album[]>(mockAlbums);
    const artistsSubject = new BehaviorSubject<Artist[]>(mockArtists);
    const loadingSubject = new BehaviorSubject<boolean>(false);

    const albumFacadeSpy = jasmine.createSpyObj('AlbumFacadeService', [
      'loadAlbums',
      'createAlbum',
      'uploadCovers',
      'deleteAlbum'
    ], {
      albums$: albumsSubject.asObservable(),
      loading$: loadingSubject.asObservable()
    });

    const artistFacadeSpy = jasmine.createSpyObj('ArtistFacadeService', [
      'loadArtists'
    ], {
      artists$: artistsSubject.asObservable(),
      loading$: loadingSubject.asObservable()
    });

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        AlbumListComponent,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([])
      ],
      providers: [
        { provide: AlbumFacadeService, useValue: albumFacadeSpy },
        { provide: ArtistFacadeService, useValue: artistFacadeSpy }
      ]
    }).compileComponents();

    albumFacadeService = TestBed.inject(AlbumFacadeService) as jasmine.SpyObj<AlbumFacadeService>;
    artistFacadeService = TestBed.inject(ArtistFacadeService) as jasmine.SpyObj<ArtistFacadeService>;

    fixture = TestBed.createComponent(AlbumListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load albums and artists on init', () => {
    expect(albumFacadeService.loadAlbums).toHaveBeenCalled();
    expect(artistFacadeService.loadArtists).toHaveBeenCalled();
  });

  it('should filter albums by search term', () => {
    component.searchTerm = 'Album 1';
    component.onSearch();
    expect(component.allAlbums.length).toBeGreaterThan(0);
  });

  it('should clear search', () => {
    component.searchTerm = 'test';
    component.clearSearch();
    expect(component.searchTerm).toBe('');
  });

  it('should show clear filters button when filters are active', () => {
    component.searchTerm = 'test';
    expect(component.showClearFiltersButton).toBe(true);
  });

  it('should clear all filters', () => {
    component.searchTerm = 'test';
    component.sortBy = 'year';
    component.clearFilters();
    expect(component.searchTerm).toBe('');
    expect(component.sortBy).toBe('title');
  });
});
