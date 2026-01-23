import { TestBed } from '@angular/core/testing';
import { DashboardFacadeService } from './dashboard-facade.service';
import { ArtistFacadeService } from './artist-facade.service';
import { AlbumFacadeService } from './album-facade.service';
import { Artist, Album } from '../models';
import { BehaviorSubject } from 'rxjs';

describe('DashboardFacadeService', () => {
  let facade: DashboardFacadeService;
  let artistFacadeSpy: jasmine.SpyObj<ArtistFacadeService>;
  let albumFacadeSpy: jasmine.SpyObj<AlbumFacadeService>;

  // BehaviorSubjects for mocking
  let artistsSubject: BehaviorSubject<Artist[]>;
  let albumsSubject: BehaviorSubject<Album[]>;
  let artistLoadingSubject: BehaviorSubject<boolean>;
  let albumLoadingSubject: BehaviorSubject<boolean>;
  let artistErrorSubject: BehaviorSubject<string | null>;
  let albumErrorSubject: BehaviorSubject<string | null>;

  const mockArtist: Artist = {
    id: 1,
    name: 'Test Artist',
    albumCount: 2,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  };

  const mockArtistWithoutAlbums: Artist = {
    id: 2,
    name: 'Artist Without Albums',
    albumCount: 0,
    createdAt: '2024-01-02',
    updatedAt: '2024-01-02'
  };

  const mockAlbum: Album = {
    id: 1,
    title: 'Album 2024',
    releaseYear: 2024,
    artistId: 1,
    artistName: 'Test Artist',
    covers: [{ id: 1, fileName: 'cover1.jpg', contentType: 'image/jpeg', fileSize: 1024, url: 'http://localhost/cover1.jpg', uploadedAt: '2024-01-01' }],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  };

  const mockAlbumWithoutCover: Album = {
    id: 2,
    title: 'Album 2023',
    releaseYear: 2023,
    artistId: 1,
    artistName: 'Test Artist',
    covers: [],
    createdAt: '2024-01-02',
    updatedAt: '2024-01-02'
  };

  beforeEach(() => {
    // Initialize BehaviorSubjects
    artistsSubject = new BehaviorSubject<Artist[]>([]);
    albumsSubject = new BehaviorSubject<Album[]>([]);
    artistLoadingSubject = new BehaviorSubject<boolean>(false);
    albumLoadingSubject = new BehaviorSubject<boolean>(false);
    artistErrorSubject = new BehaviorSubject<string | null>(null);
    albumErrorSubject = new BehaviorSubject<string | null>(null);

    // Create spy objects
    const artistSpy = jasmine.createSpyObj('ArtistFacadeService', ['loadArtists'], {
      artists$: artistsSubject.asObservable(),
      loading$: artistLoadingSubject.asObservable(),
      error$: artistErrorSubject.asObservable()
    });

    const albumSpy = jasmine.createSpyObj('AlbumFacadeService', ['loadAlbums'], {
      albums$: albumsSubject.asObservable(),
      loading$: albumLoadingSubject.asObservable(),
      error$: albumErrorSubject.asObservable()
    });

    TestBed.configureTestingModule({
      providers: [
        DashboardFacadeService,
        { provide: ArtistFacadeService, useValue: artistSpy },
        { provide: AlbumFacadeService, useValue: albumSpy }
      ]
    });

    facade = TestBed.inject(DashboardFacadeService);
    artistFacadeSpy = TestBed.inject(ArtistFacadeService) as jasmine.SpyObj<ArtistFacadeService>;
    albumFacadeSpy = TestBed.inject(AlbumFacadeService) as jasmine.SpyObj<AlbumFacadeService>;
  });

  it('should be created', () => {
    expect(facade).toBeTruthy();
  });

  describe('loadAllData', () => {
    it('should call loadArtists and loadAlbums', () => {
      facade.loadAllData();

      expect(artistFacadeSpy.loadArtists).toHaveBeenCalled();
      expect(albumFacadeSpy.loadAlbums).toHaveBeenCalled();
    });
  });

  describe('loading$', () => {
    it('should be true when either facade is loading', (done) => {
      artistLoadingSubject.next(true);
      albumLoadingSubject.next(false);

      facade.loading$.subscribe(loading => {
        expect(loading).toBe(true);
        done();
      });
    });

    it('should be false when both facades are not loading', (done) => {
      artistLoadingSubject.next(false);
      albumLoadingSubject.next(false);

      facade.loading$.subscribe(loading => {
        expect(loading).toBe(false);
        done();
      });
    });

    it('should be true when both facades are loading', (done) => {
      artistLoadingSubject.next(true);
      albumLoadingSubject.next(true);

      facade.loading$.subscribe(loading => {
        expect(loading).toBe(true);
        done();
      });
    });
  });

  describe('error$', () => {
    it('should return artist error when present', (done) => {
      artistErrorSubject.next('Artist error');
      albumErrorSubject.next(null);

      facade.error$.subscribe(error => {
        expect(error).toBe('Artist error');
        done();
      });
    });

    it('should return album error when present', (done) => {
      artistErrorSubject.next(null);
      albumErrorSubject.next('Album error');

      facade.error$.subscribe(error => {
        expect(error).toBe('Album error');
        done();
      });
    });

    it('should return null when no errors', (done) => {
      artistErrorSubject.next(null);
      albumErrorSubject.next(null);

      facade.error$.subscribe(error => {
        expect(error).toBeNull();
        done();
      });
    });
  });

  describe('stats$', () => {
    it('should calculate dashboard statistics correctly', (done) => {
      artistsSubject.next([mockArtist, mockArtistWithoutAlbums]);
      albumsSubject.next([mockAlbum, mockAlbumWithoutCover]);

      facade.stats$.subscribe(stats => {
        expect(stats.totalArtists).toBe(2);
        expect(stats.totalAlbums).toBe(2);
        expect(stats.averageAlbumsPerArtist).toBe(1.0); // 2 albums / 2 artists
        expect(stats.artistsWithoutAlbums).toBe(1);
        expect(stats.albumsWithCovers).toBe(1);
        expect(stats.albumsWithoutCovers).toBe(1);
        done();
      });
    });

    it('should handle zero artists', (done) => {
      artistsSubject.next([]);
      albumsSubject.next([mockAlbum]);

      facade.stats$.subscribe(stats => {
        expect(stats.totalArtists).toBe(0);
        expect(stats.averageAlbumsPerArtist).toBe(0); // No division by zero
        done();
      });
    });

    it('should handle empty data', (done) => {
      artistsSubject.next([]);
      albumsSubject.next([]);

      facade.stats$.subscribe(stats => {
        expect(stats.totalArtists).toBe(0);
        expect(stats.totalAlbums).toBe(0);
        expect(stats.averageAlbumsPerArtist).toBe(0);
        expect(stats.artistsWithoutAlbums).toBe(0);
        expect(stats.albumsWithCovers).toBe(0);
        expect(stats.albumsWithoutCovers).toBe(0);
        done();
      });
    });

    it('should calculate average correctly with decimal', (done) => {
      artistsSubject.next([mockArtist, mockArtistWithoutAlbums]);
      albumsSubject.next([mockAlbum, mockAlbumWithoutCover, mockAlbum]);

      facade.stats$.subscribe(stats => {
        expect(stats.totalAlbums).toBe(3);
        expect(stats.averageAlbumsPerArtist).toBe(1.5); // 3 albums / 2 artists
        done();
      });
    });
  });

  describe('recentAlbums$', () => {
    it('should return 5 most recent albums', (done) => {
      const albums: Album[] = [
        { ...mockAlbum, id: 1, releaseYear: 2020, title: 'Album 2020' },
        { ...mockAlbum, id: 2, releaseYear: 2024, title: 'Album 2024' },
        { ...mockAlbum, id: 3, releaseYear: 2022, title: 'Album 2022' },
        { ...mockAlbum, id: 4, releaseYear: 2023, title: 'Album 2023' },
        { ...mockAlbum, id: 5, releaseYear: 2021, title: 'Album 2021' },
        { ...mockAlbum, id: 6, releaseYear: 2019, title: 'Album 2019' }
      ];

      albumsSubject.next(albums);

      facade.recentAlbums$.subscribe(recent => {
        expect(recent.length).toBe(5);
        expect(recent[0].releaseYear).toBe(2024); // Most recent first
        expect(recent[1].releaseYear).toBe(2023);
        expect(recent[2].releaseYear).toBe(2022);
        expect(recent[3].releaseYear).toBe(2021);
        expect(recent[4].releaseYear).toBe(2020);
        done();
      });
    });

    it('should return all albums if less than 5', (done) => {
      const albums: Album[] = [
        { ...mockAlbum, id: 1, releaseYear: 2024 },
        { ...mockAlbum, id: 2, releaseYear: 2023 }
      ];

      albumsSubject.next(albums);

      facade.recentAlbums$.subscribe(recent => {
        expect(recent.length).toBe(2);
        done();
      });
    });

    it('should return empty array when no albums', (done) => {
      albumsSubject.next([]);

      facade.recentAlbums$.subscribe(recent => {
        expect(recent.length).toBe(0);
        done();
      });
    });

    it('should map to correct structure', (done) => {
      albumsSubject.next([mockAlbum]);

      facade.recentAlbums$.subscribe(recent => {
        expect(recent[0].id).toBe(mockAlbum.id);
        expect(recent[0].title).toBe(mockAlbum.title);
        expect(recent[0].artistName).toBe(mockAlbum.artistName);
        expect(recent[0].releaseYear).toBe(mockAlbum.releaseYear);
        // Should not have covers property
        expect((recent[0] as any).covers).toBeUndefined();
        done();
      });
    });
  });

  describe('passthrough observables', () => {
    it('should expose artists$ from ArtistFacadeService', (done) => {
      artistsSubject.next([mockArtist]);

      facade.artists$.subscribe(artists => {
        expect(artists).toEqual([mockArtist]);
        done();
      });
    });

    it('should expose albums$ from AlbumFacadeService', (done) => {
      albumsSubject.next([mockAlbum]);

      facade.albums$.subscribe(albums => {
        expect(albums).toEqual([mockAlbum]);
        done();
      });
    });
  });

  // describe('integration scenarios', () => {
  //   it('should update stats when artists change', (done) => {
  //     albumsSubject.next([mockAlbum]);

  //     // Start with one artist
  //     artistsSubject.next([mockArtist]);

  //     let callCount = 0;
  //     facade.stats$.subscribe(stats => {
  //       callCount++;
  //       if (callCount === 1) {
  //         expect(stats.totalArtists).toBe(1);
  //       } else if (callCount === 2) {
  //         // Add another artist
  //         expect(stats.totalArtists).toBe(2);
  //         done();
  //       }
  //     });

  //     // Trigger update
  //     setTimeout(() => {
  //       artistsSubject.next([mockArtist, mockArtistWithoutAlbums]);
  //     }, 100);
  //   });

  //   it('should update stats when albums change', (done) => {
  //     artistsSubject.next([mockArtist]);

  //     // Start with one album
  //     albumsSubject.next([mockAlbum]);

  //     let callCount = 0;
  //     facade.stats$.subscribe(stats => {
  //       callCount++;
  //       if (callCount === 1) {
  //         expect(stats.totalAlbums).toBe(1);
  //       } else if (callCount === 2) {
  //         expect(stats.totalAlbums).toBe(2);
  //         done();
  //       }
  //     });

  //     // Trigger update
  //     setTimeout(() => {
  //       albumsSubject.next([mockAlbum, mockAlbumWithoutCover]);
  //     }, 100);
  //   });
  // });

});
