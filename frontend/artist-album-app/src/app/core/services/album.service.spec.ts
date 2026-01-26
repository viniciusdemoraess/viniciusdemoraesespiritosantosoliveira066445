import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AlbumService } from '@core/services/album.service';
import { Album, Page } from '@core/models';

describe('AlbumService', () => {
  let service: AlbumService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AlbumService]
    });
    service = TestBed.inject(AlbumService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getAllAlbums', () => {
    it('should fetch paginated albums', (done) => {
      const mockResponse: Page<Album> = {
        content: [
          {
            id: 1,
            title: 'Harakiri',
            artistId: 1,
            artistName: 'Serj Tankian',
            releaseYear: 2012,
            covers: [],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          }
        ],
        totalElements: 1,
        totalPages: 1,
        size: 10,
        number: 0,
        pageable: {
          pageNumber: 0,
          pageSize: 10,
          offset: 0,
          paged: true,
          unpaged: false,
          sort: { empty: true, sorted: false, unsorted: true }
        },
        first: true,
        last: true,
        numberOfElements: 1,
        empty: false,
        sort: { empty: true, sorted: false, unsorted: true }
      };

      service.getAllAlbums().subscribe(response => {
        expect(response.content.length).toBe(1);
        expect(response.content[0].title).toBe('Harakiri');
        done();
      });

      const req = httpMock.expectOne(req => req.url.includes('/api/v1/albums'));
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should filter by artistId', (done) => {
      const mockResponse: Page<Album> = {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 10,
        number: 0,
        pageable: {
          pageNumber: 0,
          pageSize: 10,
          offset: 0,
          paged: true,
          unpaged: false,
          sort: { empty: true, sorted: false, unsorted: true }
        },
        first: true,
        last: true,
        numberOfElements: 0,
        empty: true,
        sort: { empty: true, sorted: false, unsorted: true }
      };

      service.getAllAlbums(0, 10, 'title', 'asc', 1).subscribe(() => done());

      const req = httpMock.expectOne(req =>
        req.url.includes('/api/v1/albums') && req.params.has('artistId')
      );
      expect(req.request.params.get('artistId')).toBe('1');
      req.flush(mockResponse);
    });
  });

  describe('getAlbumById', () => {
    it('should fetch album by id', (done) => {
      const mockAlbum: Album = {
        id: 1,
        title: 'Harakiri',
        artistId: 1,
        artistName: 'Serj Tankian',
        releaseYear: 2012,
        covers: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };

      service.getAlbumById(1).subscribe(album => {
        expect(album.id).toBe(1);
        expect(album.title).toBe('Harakiri');
        done();
      });

      const req = httpMock.expectOne('http://localhost:8080/api/v1/albums/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockAlbum);
    });
  });

  describe('createAlbum', () => {
    it('should create new album', (done) => {
      const newAlbum = {
        title: 'New Album',
        artistId: 1,
        releaseYear: 2023
      };

      const createdAlbum: Album = {
        id: 2,
        title: 'New Album',
        artistId: 1,
        artistName: 'Test Artist',
        releaseYear: 2023,
        covers: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };

      service.createAlbum(newAlbum).subscribe(album => {
        expect(album.id).toBe(2);
        expect(album.title).toBe('New Album');
        done();
      });

      const req = httpMock.expectOne('http://localhost:8080/api/v1/albums');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newAlbum);
      req.flush(createdAlbum);
    });
  });

  describe('updateAlbum', () => {
    it('should update existing album', (done) => {
      const updateData = {
        title: 'Updated Album',
        artistId: 1,
        releaseYear: 2023
      };

      const updatedAlbum: Album = {
        id: 1,
        title: 'Updated Album',
        artistId: 1,
        artistName: 'Test Artist',
        releaseYear: 2023,
        covers: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };

      service.updateAlbum(1, updateData).subscribe(album => {
        expect(album.title).toBe('Updated Album');
        done();
      });

      const req = httpMock.expectOne('http://localhost:8080/api/v1/albums/1');
      expect(req.request.method).toBe('PUT');
      req.flush(updatedAlbum);
    });
  });

  describe('deleteAlbum', () => {
    it('should delete album', (done) => {
      service.deleteAlbum(1).subscribe(() => {
        expect(true).toBe(true);
        done();
      });

      const req = httpMock.expectOne('http://localhost:8080/api/v1/albums/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('uploadCovers', () => {
    it('should upload album covers with FormData', (done) => {
      const albumId = 1;
      const mockFiles = [
        new File(['content1'], 'cover1.jpg', { type: 'image/jpeg' }),
        new File(['content2'], 'cover2.jpg', { type: 'image/jpeg' })
      ];

      const mockResponse: Album = {
        id: 1,
        title: 'Test Album',
        artistId: 1,
        artistName: 'Test Artist',
        releaseYear: 2024,
        covers: [
          { id: 1, fileName: 'cover1.jpg', url: 'url1.jpg', contentType: 'image/jpeg', fileSize: 1000, uploadedAt: '2024-01-01T00:00:00Z' },
          { id: 2, fileName: 'cover2.jpg', url: 'url2.jpg', contentType: 'image/jpeg', fileSize: 1000, uploadedAt: '2024-01-01T00:00:00Z' }
        ],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };

      service.uploadCovers(albumId, mockFiles).subscribe(response => {
        expect(response.covers.length).toBe(2);
        expect(response.covers[0].fileName).toBe('cover1.jpg');
        done();
      });

      const req = httpMock.expectOne('http://localhost:8080/api/v1/albums/1/covers');
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBe(true);
      req.flush(mockResponse);
    });

    it('should handle empty files array', (done) => {
      const albumId = 1;
      const mockFiles: File[] = [];

      const mockResponse: Album = {
        id: 1,
        title: 'Test Album',
        artistId: 1,
        artistName: 'Test Artist',
        releaseYear: 2024,
        covers: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };

      service.uploadCovers(albumId, mockFiles).subscribe(response => {
        expect(response.covers.length).toBe(0);
        done();
      });

      const req = httpMock.expectOne('http://localhost:8080/api/v1/albums/1/covers');
      req.flush(mockResponse);
    });
  });
});
