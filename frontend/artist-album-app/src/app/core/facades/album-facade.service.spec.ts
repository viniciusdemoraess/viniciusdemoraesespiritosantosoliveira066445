import { TestBed } from '@angular/core/testing';
import { AlbumFacadeService } from './album-facade.service';
import { AlbumService } from '../services/album.service';
import { Album, Page } from '../models';
import { of, throwError } from 'rxjs';

describe('AlbumFacadeService', () => {
  let facade: AlbumFacadeService;
  let albumServiceSpy: jasmine.SpyObj<AlbumService>;

  const mockAlbum: Album = {
    id: 1,
    title: 'Test Album',
    releaseYear: 2024,
    artistId: 1,
    artistName: 'Test Artist',
    covers: [
      { id: 1, fileName: 'cover1.jpg', contentType: 'image/jpeg', fileSize: 1024, url: 'http://localhost/cover1.jpg', uploadedAt: '2024-01-01' },
      { id: 2, fileName: 'cover2.jpg', contentType: 'image/jpeg', fileSize: 2048, url: 'http://localhost/cover2.jpg', uploadedAt: '2024-01-01' }
    ],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  };

  const mockPage: Page<Album> = {
    content: [mockAlbum],
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
    const spy = jasmine.createSpyObj('AlbumService', [
      'getAllAlbums',
      'createAlbum',
      'deleteAlbum',
      'uploadCovers'
    ]);

    TestBed.configureTestingModule({
      providers: [
        AlbumFacadeService,
        { provide: AlbumService, useValue: spy }
      ]
    });

    facade = TestBed.inject(AlbumFacadeService);
    albumServiceSpy = TestBed.inject(AlbumService) as jasmine.SpyObj<AlbumService>;
  });

  it('should be created', () => {
    expect(facade).toBeTruthy();
  });

  describe('loadAlbums', () => {
    it('should load albums successfully', (done) => {
      albumServiceSpy.getAllAlbums.and.returnValue(of(mockPage));

      facade.albums$.subscribe(albums => {
        if (albums.length > 0) {
          expect(albums).toEqual([mockAlbum]);
          expect(albums.length).toBe(1);
          done();
        }
      });

      facade.loadAlbums();
    });

    it('should set loading state during load', (done) => {
      albumServiceSpy.getAllAlbums.and.returnValue(of(mockPage));

      const loadingStates: boolean[] = [];
      facade.loading$.subscribe(loading => {
        loadingStates.push(loading);

        if (loadingStates.length === 2) {
          expect(loadingStates).toEqual([true, false]);
          done();
        }
      });

      facade.loadAlbums();
    });

    it('should handle load errors', (done) => {
      albumServiceSpy.getAllAlbums.and.returnValue(
        throwError(() => new Error('Network error'))
      );

      facade.error$.subscribe(error => {
        if (error) {
          expect(error).toBe('Erro ao carregar álbuns');
          done();
        }
      });

      facade.loadAlbums();
    });
  });

  describe('createAlbum', () => {
    it('should create album and update state', (done) => {
      const newAlbumData = {
        title: 'New Album',
        releaseYear: 2024,
        artistId: 1
      };
      const createdAlbum: Album = {
        ...mockAlbum,
        id: 2,
        ...newAlbumData
      };

      albumServiceSpy.createAlbum.and.returnValue(of(createdAlbum));

      // Load initial albums
      albumServiceSpy.getAllAlbums.and.returnValue(of(mockPage));
      facade.loadAlbums();

      facade.createAlbum(newAlbumData).subscribe({
        next: (album) => {
          expect(album).toEqual(createdAlbum);

          facade.albums$.subscribe(albums => {
            expect(albums.length).toBe(2);
            expect(albums).toContain(createdAlbum);
            done();
          });
        }
      });
    });

    it('should handle create album error', (done) => {
      const albumData = { title: 'Album', releaseYear: 2024, artistId: 1 };
      albumServiceSpy.createAlbum.and.returnValue(
        throwError(() => ({ error: { message: 'Invalid data' } }))
      );

      facade.createAlbum(albumData).subscribe({
        error: (error) => {
          expect(error.error.message).toBe('Invalid data');
          done();
        }
      });
    });
  });

  describe('deleteAlbum', () => {
    it('should delete album and update state', (done) => {
      albumServiceSpy.deleteAlbum.and.returnValue(of(void 0));

      // Load albums first
      const multipleAlbums: Page<Album> = {
        ...mockPage,
        content: [
          mockAlbum,
          { ...mockAlbum, id: 2, title: 'Album 2' }
        ],
        totalElements: 2
      };
      albumServiceSpy.getAllAlbums.and.returnValue(of(multipleAlbums));
      facade.loadAlbums();

      setTimeout(() => {
        facade.deleteAlbum(1).subscribe({
          next: () => {
            facade.albums$.subscribe(albums => {
              expect(albums.length).toBe(1);
              expect(albums.find(a => a.id === 1)).toBeUndefined();
              done();
            });
          }
        });
      }, 100);
    });

    it('should handle delete album error', (done) => {
      albumServiceSpy.deleteAlbum.and.returnValue(
        throwError(() => new Error('Delete failed'))
      );

      facade.deleteAlbum(1).subscribe({
        error: (error) => {
          expect(error.message).toBe('Delete failed');
          done();
        }
      });
    });
  });

  describe('uploadCovers', () => {
    it('should call albumService.uploadCovers', (done) => {
      const files = [new File([''], 'cover.jpg')];
      const uploadResponse = { ...mockAlbum, covers: [...mockAlbum.covers, { id: 3, fileName: 'cover.jpg', contentType: 'image/jpeg', fileSize: 512, url: 'http://localhost/cover.jpg', uploadedAt: '2024-01-01' }] };
      facade.uploadCovers(1, files).subscribe({
        next: (response) => {
          expect(response).toEqual(uploadResponse);
          expect(albumServiceSpy.uploadCovers).toHaveBeenCalledWith(1, files);
          done();
        }
      });
    });

    it('should handle upload error', (done) => {
      const files = [new File([''], 'cover.jpg')];
      albumServiceSpy.uploadCovers.and.returnValue(
        throwError(() => new Error('Upload failed'))
      );

      facade.uploadCovers(1, files).subscribe({
        error: (error) => {
          expect(error.message).toBe('Upload failed');
          done();
        }
      });
    });
  });

  describe('updateAlbum', () => {
    it('should update album in state', (done) => {
      albumServiceSpy.getAllAlbums.and.returnValue(of(mockPage));
      facade.loadAlbums();

      setTimeout(() => {
        facade.updateAlbum(1, { title: 'Updated Title' }).subscribe({
          next: (updated) => {
            expect(updated.title).toBe('Updated Title');

            facade.albums$.subscribe(albums => {
              const found = albums.find(a => a.id === 1);
              expect(found?.title).toBe('Updated Title');
              done();
            });
          }
        });
      }, 100);
    });

    it('should handle album not found', (done) => {
      facade.updateAlbum(999, { title: 'Test' }).subscribe({
        error: (error) => {
          expect(error.message).toBe('Album not found');
          done();
        }
      });
    });
  });

  describe('derived state', () => {
    it('should calculate total albums', (done) => {
      albumServiceSpy.getAllAlbums.and.returnValue(of(mockPage));
      facade.loadAlbums();

      facade.totalAlbums$.subscribe(total => {
        if (total > 0) {
          expect(total).toBe(1);
          done();
        }
      });
    });

    it('should calculate albums with covers', (done) => {
      albumServiceSpy.getAllAlbums.and.returnValue(of(mockPage));
      facade.loadAlbums();

      facade.albumsWithCovers$.subscribe(count => {
        if (count > 0) {
          expect(count).toBe(1);
          done();
        }
      });
    });

    it('should calculate albums without covers', (done) => {
      const albumWithoutCovers = { ...mockAlbum, covers: [] };
      const page: Page<Album> = {
        ...mockPage,
        content: [albumWithoutCovers]
      };

      albumServiceSpy.getAllAlbums.and.returnValue(of(page));
      facade.loadAlbums();

      facade.albumsWithoutCovers$.subscribe(count => {
        if (count > 0) {
          expect(count).toBe(1);
          done();
        }
      });
    });
  });

  describe('getAlbumsByArtist$', () => {
    it('should filter albums by artist ID', (done) => {
      const albums: Page<Album> = {
        ...mockPage,
        content: [
          mockAlbum,
          { ...mockAlbum, id: 2, artistId: 2, artistName: 'Artist 2' }
        ],
        totalElements: 2
      };

      albumServiceSpy.getAllAlbums.and.returnValue(of(albums));
      facade.loadAlbums();

      setTimeout(() => {
        facade.getAlbumsByArtist$(1).subscribe(filtered => {
          expect(filtered.length).toBe(1);
          expect(filtered[0].artistId).toBe(1);
          done();
        });
      }, 100);
    });
  });

  describe('utility methods', () => {
    it('should return albums snapshot', () => {
      albumServiceSpy.getAllAlbums.and.returnValue(of(mockPage));
      facade.loadAlbums();

      setTimeout(() => {
        const snapshot = facade.getAlbumsSnapshot();
        expect(snapshot).toEqual([mockAlbum]);
      }, 100);
    });

    it('should clear state', (done) => {
      albumServiceSpy.getAllAlbums.and.returnValue(of(mockPage));
      facade.loadAlbums();

      setTimeout(() => {
        facade.clearState();

        facade.albums$.subscribe(albums => {
          expect(albums.length).toBe(0);
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

    it('should refresh album data', () => {
      albumServiceSpy.getAllAlbums.and.returnValue(of(mockPage));

      facade.refreshAlbum(1);

      expect(albumServiceSpy.getAllAlbums).toHaveBeenCalled();
    });
  });
});
