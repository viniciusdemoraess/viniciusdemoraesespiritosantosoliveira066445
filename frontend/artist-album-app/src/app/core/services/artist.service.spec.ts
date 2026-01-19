import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ArtistService } from './artist.service';
import { Artist, Page } from '../models';

describe('ArtistService', () => {
  let service: ArtistService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ArtistService]
    });
    service = TestBed.inject(ArtistService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getAll', () => {
    it('should fetch paginated artists', (done) => {
      const mockResponse: Page<Artist> = {
        content: [
          { id: 1, name: 'Serj Tankian', bio: 'Musician', createdAt: new Date(), updatedAt: new Date() },
          { id: 2, name: 'Mike Shinoda', bio: 'Artist', createdAt: new Date(), updatedAt: new Date() }
        ],
        totalElements: 2,
        totalPages: 1,
        size: 10,
        number: 0
      };

      service.getAll().subscribe(response => {
        expect(response.content.length).toBe(2);
        expect(response.content[0].name).toBe('Serj Tankian');
        expect(response.totalElements).toBe(2);
        done();
      });

      const req = httpMock.expectOne(req => req.url.includes('/api/v1/artists'));
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('0');
      expect(req.request.params.get('size')).toBe('10');
      req.flush(mockResponse);
    });

    it('should apply search filter', (done) => {
      const mockResponse: Page<Artist> = {
        content: [{ id: 1, name: 'Serj Tankian', bio: 'Test', createdAt: new Date(), updatedAt: new Date() }],
        totalElements: 1,
        totalPages: 1,
        size: 10,
        number: 0
      };

      service.getAll(0, 10, 'Serj').subscribe(response => {
        expect(response.content.length).toBe(1);
        expect(response.content[0].name).toBe('Serj Tankian');
        done();
      });

      const req = httpMock.expectOne(req =>
        req.url.includes('/api/v1/artists') && req.params.has('name')
      );
      expect(req.request.params.get('name')).toBe('Serj');
      req.flush(mockResponse);
    });

    it('should apply sorting', (done) => {
      const mockResponse: Page<Artist> = {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 10,
        number: 0
      };

      service.getAll(0, 10, '', 'name,desc').subscribe(() => done());

      const req = httpMock.expectOne(req =>
        req.url.includes('/api/v1/artists') && req.params.has('sort')
      );
      expect(req.request.params.get('sort')).toBe('name,desc');
      req.flush(mockResponse);
    });
  });

  describe('getById', () => {
    it('should fetch artist by id', (done) => {
      const mockArtist: Artist = {
        id: 1,
        name: 'Serj Tankian',
        bio: 'Musician',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      service.getById(1).subscribe(artist => {
        expect(artist.id).toBe(1);
        expect(artist.name).toBe('Serj Tankian');
        done();
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/artists/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockArtist);
    });
  });

  describe('create', () => {
    it('should create new artist', (done) => {
      const newArtist: Partial<Artist> = {
        name: 'New Artist',
        bio: 'Bio text'
      };

      const createdArtist: Artist = {
        id: 3,
        name: 'New Artist',
        bio: 'Bio text',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      service.create(newArtist).subscribe(artist => {
        expect(artist.id).toBe(3);
        expect(artist.name).toBe('New Artist');
        done();
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/artists`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newArtist);
      req.flush(createdArtist);
    });
  });

  describe('update', () => {
    it('should update existing artist', (done) => {
      const updatedArtist: Artist = {
        id: 1,
        name: 'Updated Name',
        bio: 'Updated Bio',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      service.update(1, updatedArtist).subscribe(artist => {
        expect(artist.name).toBe('Updated Name');
        expect(artist.bio).toBe('Updated Bio');
        done();
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/artists/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedArtist);
      req.flush(updatedArtist);
    });
  });

  describe('delete', () => {
    it('should delete artist', (done) => {
      service.delete(1).subscribe(() => {
        expect(true).toBe(true); // Verify observable completes
        done();
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/artists/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
