import { TestBed } from '@angular/core/testing';
import { ArtistFacadeService } from './artist-facade.service';
import { ArtistService } from '../services/artist.service';
import { Artist, Page } from '../models';
import { of, throwError } from 'rxjs';

describe('ArtistFacadeService', () => {
  let facade: ArtistFacadeService;
  let artistServiceSpy: jasmine.SpyObj<ArtistService>;

  const mockArtist: Artist = {
    id: 1,
    name: 'Test Artist',
    albumCount: 5,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  };

  const mockPage: Page<Artist> = {
    content: [mockArtist],
    pageable: {
      pageNumber: 0,
      pageSize: 10,
      sort: { sorted: false, unsorted: true, empty: true },
      offset: 0,
      paged: true,
      unpaged: false
    },
    totalPages: 1,
    totalElements: 1,
    last: true,
    first: true,
    numberOfElements: 1,
    size: 10,
    number: 0,
    sort: { sorted: false, unsorted: true, empty: true },
    empty: false
  };

  beforeEach(() => {
    // Create spy object for ArtistService
    const spy = jasmine.createSpyObj('ArtistService', [
      'getAllArtists',
      'createArtist',
      'updateArtist',
      'deleteArtist'
    ]);

    TestBed.configureTestingModule({
      providers: [
        ArtistFacadeService,
        { provide: ArtistService, useValue: spy }
      ]
    });

    facade = TestBed.inject(ArtistFacadeService);
    artistServiceSpy = TestBed.inject(ArtistService) as jasmine.SpyObj<ArtistService>;
  });

  it('should be created', () => {
    expect(facade).toBeTruthy();
  });

  describe('loadArtists', () => {
    it('should load artists successfully', (done) => {
      artistServiceSpy.getAllArtists.and.returnValue(of(mockPage));

      facade.artists$.subscribe(artists => {
        if (artists.length > 0) {
          expect(artists).toEqual([mockArtist]);
          expect(artists.length).toBe(1);
          done();
        }
      });

      facade.loadArtists();
    });

    it('should set loading state to true then false', (done) => {
      artistServiceSpy.getAllArtists.and.returnValue(of(mockPage));

      const loadingStates: boolean[] = [];
      facade.loading$.subscribe(loading => {
        loadingStates.push(loading);

        if (loadingStates.length === 2) {
          expect(loadingStates).toEqual([true, false]);
          done();
        }
      });

      facade.loadArtists();
    });

    it('should handle errors when loading artists', (done) => {
      const errorMessage = 'Network error';
      artistServiceSpy.getAllArtists.and.returnValue(
        throwError(() => new Error(errorMessage))
      );

      facade.error$.subscribe(error => {
        if (error) {
          expect(error).toBe('Erro ao carregar artistas');
          done();
        }
      });

      facade.loadArtists();
    });

    it('should set loading to false after error', (done) => {
      artistServiceSpy.getAllArtists.and.returnValue(
        throwError(() => new Error('Error'))
      );

      facade.loading$.subscribe(loading => {
        if (!loading) {
          expect(loading).toBe(false);
          done();
        }
      });

      facade.loadArtists();
    });
  });

  describe('createArtist', () => {
    it('should create artist and update state', (done) => {
      const newArtist: Artist = { ...mockArtist, id: 2, name: 'New Artist' };
      artistServiceSpy.createArtist.and.returnValue(of(newArtist));

      // First load some artists
      artistServiceSpy.getAllArtists.and.returnValue(of(mockPage));
      facade.loadArtists();

      facade.createArtist('New Artist').subscribe({
        next: (artist) => {
          expect(artist).toEqual(newArtist);
          expect(artistServiceSpy.createArtist).toHaveBeenCalledWith('New Artist');

          // Check if state was updated
          facade.artists$.subscribe(artists => {
            expect(artists.length).toBe(2);
            expect(artists).toContain(newArtist);
            done();
          });
        }
      });
    });

    it('should handle create artist error', (done) => {
      const errorMessage = 'Artist already exists';
      artistServiceSpy.createArtist.and.returnValue(
        throwError(() => ({ error: { message: errorMessage } }))
      );

      facade.createArtist('Duplicate Artist').subscribe({
        error: (error) => {
          expect(error.error.message).toBe(errorMessage);
          done();
        }
      });
    });
  });

  describe('updateArtist', () => {
    it('should update artist and refresh state', (done) => {
      const updatedArtist: Artist = { ...mockArtist, name: 'Updated Artist' };
      artistServiceSpy.updateArtist.and.returnValue(of(updatedArtist));

      // First load artists
      artistServiceSpy.getAllArtists.and.returnValue(of(mockPage));
      facade.loadArtists();

      facade.updateArtist(1, 'Updated Artist').subscribe({
        next: (artist) => {
          expect(artist.name).toBe('Updated Artist');

          facade.artists$.subscribe(artists => {
            const found = artists.find(a => a.id === 1);
            expect(found?.name).toBe('Updated Artist');
            done();
          });
        }
      });
    });

    it('should handle update artist error', (done) => {
      artistServiceSpy.updateArtist.and.returnValue(
        throwError(() => new Error('Update failed'))
      );

      facade.updateArtist(1, 'New Name').subscribe({
        error: (error) => {
          expect(error.message).toBe('Update failed');
          done();
        }
      });
    });
  });

  describe('deleteArtist', () => {
    it('should delete artist and update state', (done) => {
      artistServiceSpy.deleteArtist.and.returnValue(of(void 0));

      // Load artists first
      const multipleArtists: Page<Artist> = {
        ...mockPage,
        content: [mockArtist, { ...mockArtist, id: 2, name: 'Artist 2' }],
        totalElements: 2
      };
      artistServiceSpy.getAllArtists.and.returnValue(of(multipleArtists));
      facade.loadArtists();

      setTimeout(() => {
        facade.deleteArtist(1).subscribe({
          next: () => {
            facade.artists$.subscribe(artists => {
              expect(artists.length).toBe(1);
              expect(artists.find(a => a.id === 1)).toBeUndefined();
              done();
            });
          }
        });
      }, 100);
    });

    it('should handle delete artist error', (done) => {
      artistServiceSpy.deleteArtist.and.returnValue(
        throwError(() => new Error('Delete failed'))
      );

      facade.deleteArtist(1).subscribe({
        error: (error) => {
          expect(error.message).toBe('Delete failed');
          done();
        }
      });
    });
  });

  describe('derived state', () => {
    it('should calculate total artists', (done) => {
      artistServiceSpy.getAllArtists.and.returnValue(of(mockPage));
      facade.loadArtists();

      facade.totalArtists$.subscribe(total => {
        if (total > 0) {
          expect(total).toBe(1);
          done();
        }
      });
    });

    it('should calculate artists without albums', (done) => {
      const artistWithoutAlbums = { ...mockArtist, albumCount: 0 };
      const page: Page<Artist> = {
        ...mockPage,
        content: [artistWithoutAlbums]
      };

      artistServiceSpy.getAllArtists.and.returnValue(of(page));
      facade.loadArtists();

      facade.artistsWithoutAlbums$.subscribe(count => {
        if (count > 0) {
          expect(count).toBe(1);
          done();
        }
      });
    });
  });

  describe('utility methods', () => {
    it('should return artists snapshot', () => {
      artistServiceSpy.getAllArtists.and.returnValue(of(mockPage));
      facade.loadArtists();

      setTimeout(() => {
        const snapshot = facade.getArtistsSnapshot();
        expect(snapshot).toEqual([mockArtist]);
      }, 100);
    });

    it('should clear state', (done) => {
      artistServiceSpy.getAllArtists.and.returnValue(of(mockPage));
      facade.loadArtists();

      setTimeout(() => {
        facade.clearState();

        facade.artists$.subscribe(artists => {
          expect(artists.length).toBe(0);
        });

        facade.loading$.subscribe(loading => {
          expect(loading).toBe(false);
        });

        facade.error$.subscribe(error => {
          expect(error).toBeNull();
          done();
        });
      }, 100);
    });
  });
});
