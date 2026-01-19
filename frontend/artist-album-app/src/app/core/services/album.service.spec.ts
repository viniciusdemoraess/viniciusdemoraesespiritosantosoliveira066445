import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AlbumService } from './album.service';
import { Album, Page } from '../models';

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

  describe('getAll', () => {
    it('should fetch paginated albums', (done) => {
      const mockResponse: Page<Album> = {
        content: [
          {
            id: 1,
            title: 'Harakiri',
            artistId: 1,
            artistName: 'Serj Tankian',
            releaseYear: 2012,
            coverUrls: [],
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        totalElements: 1,
        totalPages: 1,
        size: 10,
        number: 0
      };

      service.getAll().subscribe(response => {
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
        number: 0
      };

      service.getAll(0, 10, 1).subscribe(() => done());

      const req = httpMock.expectOne(req =>
        req.url.includes('/api/v1/albums') && req.params.has('artistId')
      );
      expect(req.request.params.get('artistId')).toBe('1');
      req.flush(mockResponse);
    });
  });

  describe('getById', () => {
    it('should fetch album by id', (done) => {
      const mockAlbum: Album = {
        id: 1,
        title: 'Harakiri',
        artistId: 1,
        artistName: 'Serj Tankian',
        releaseYear: 2012,
        coverUrls: ['cover1.jpg'],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      service.getById(1).subscribe(album => {
        expect(album.id).toBe(1);
        expect(album.title).toBe('Harakiri');
        done();
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/albums/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAlbum);
    });
  });

  describe('create', () => {
    it('should create new album', (done) => {
      const newAlbum: Partial<Album> = {
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
        coverUrls: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      service.create(newAlbum).subscribe(album => {
        expect(album.id).toBe(2);
        expect(album.title).toBe('New Album');
        done();
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/albums`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newAlbum);
      req.flush(createdAlbum);
    });
  });

  describe('update', () => {
    it('should update existing album', (done) => {
      const updatedAlbum: Album = {
        id: 1,
        title: 'Updated Album',
        artistId: 1,
        artistName: 'Test Artist',
        releaseYear: 2023,
        coverUrls: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      service.update(1, updatedAlbum).subscribe(album => {
        expect(album.title).toBe('Updated Album');
        done();
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/albums/1`);
      expect(req.request.method).toBe('PUT');
      req.flush(updatedAlbum);
    });
  });

  describe('delete', () => {
    it('should delete album', (done) => {
      service.delete(1).subscribe(() => {
        expect(true).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/albums/1`);
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

      const mockResponse = { coverUrls: ['url1.jpg', 'url2.jpg'] };

      service.uploadCovers(albumId, mockFiles).subscribe(response => {
        expect(response.coverUrls.length).toBe(2);
        expect(response.coverUrls[0]).toBe('url1.jpg');
        done();
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/albums/upload?albumId=${albumId}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBe(true);
      req.flush(mockResponse);
    });

    it('should handle empty files array', (done) => {
      const albumId = 1;
      const mockFiles: File[] = [];

      const mockResponse = { coverUrls: [] };

      service.uploadCovers(albumId, mockFiles).subscribe(response => {
        expect(response.coverUrls.length).toBe(0);
        done();
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/albums/upload?albumId=${albumId}`);
      req.flush(mockResponse);
    });
  });
});
