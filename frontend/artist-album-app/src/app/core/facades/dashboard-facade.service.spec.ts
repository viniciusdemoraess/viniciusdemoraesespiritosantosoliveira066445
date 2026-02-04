import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DashboardFacadeService } from '@core/facades/dashboard-facade.service';
import { DashboardService, DashboardStats } from '@core/services/dashboard.service';
import { environment } from '@environments/environment';

describe('DashboardFacadeService', () => {
  let facade: DashboardFacadeService;
  let service: DashboardService;
  let httpMock: HttpTestingController;

  const mockStats: DashboardStats = {
    totalArtists: 2,
    totalAlbums: 2,
    averageAlbumsPerArtist: 1.0,
    artistsWithoutAlbums: 1,
    albumsWithCovers: 1,
    albumsWithoutCovers: 1,
    recentAlbums: [
      {
        id: 1,
        title: 'Album 2024',
        artistNames: 'Test Artist',
        releaseYear: 2024,
        totalTracks: 10,
        genre: 'Rock'
      }
    ]
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DashboardFacadeService, DashboardService]
    });

    facade = TestBed.inject(DashboardFacadeService);
    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(facade).toBeTruthy();
  });

  describe('loadAllData', () => {
    it('should load dashboard data and update stats and recentAlbums', (done) => {
      facade.loadAllData();

      const req = httpMock.expectOne(`${environment.apiUrl}/dashboard/stats`);
      expect(req.request.method).toBe('GET');
      req.flush(mockStats);

      facade.stats$.subscribe(stats => {
        if (stats.totalArtists > 0) {
          expect(stats.totalArtists).toBe(2);
          expect(stats.totalAlbums).toBe(2);
          done();
        }
      });
    });

    it('should handle errors when loading data', (done) => {
      facade.loadAllData();

      const req = httpMock.expectOne(`${environment.apiUrl}/dashboard/stats`);
      req.flush('Error loading dashboard', { status: 500, statusText: 'Server Error' });

      facade.error$.subscribe(error => {
        if (error) {
          expect(error).toContain('Erro ao carregar estatísticas');
          done();
        }
      });
    });
  });

  describe('stats$', () => {
    it('should emit dashboard statistics', (done) => {
      facade.loadAllData();

      const req = httpMock.expectOne(`${environment.apiUrl}/dashboard/stats`);
      req.flush(mockStats);

      facade.stats$.subscribe(stats => {
        if (stats.totalArtists > 0) {
          expect(stats.totalArtists).toBe(mockStats.totalArtists);
          expect(stats.totalAlbums).toBe(mockStats.totalAlbums);
          expect(stats.averageAlbumsPerArtist).toBe(mockStats.averageAlbumsPerArtist);
          expect(stats.artistsWithoutAlbums).toBe(mockStats.artistsWithoutAlbums);
          expect(stats.albumsWithCovers).toBe(mockStats.albumsWithCovers);
          expect(stats.albumsWithoutCovers).toBe(mockStats.albumsWithoutCovers);
          done();
        }
      });
    });
  });

  describe('recentAlbums$', () => {
    it('should emit recent albums', (done) => {
      facade.loadAllData();

      const req = httpMock.expectOne(`${environment.apiUrl}/dashboard/stats`);
      req.flush(mockStats);

      facade.recentAlbums$.subscribe(albums => {
        if (albums.length > 0) {
          expect(albums.length).toBe(1);
          expect(albums[0].id).toBe(1);
          expect(albums[0].title).toBe('Album 2024');
          expect(albums[0].artistNames).toBe('Test Artist');
          done();
        }
      });
    });
  });

  describe('loading$', () => {
    it('should emit true while loading', () => {
      let loadingStates: boolean[] = [];

      facade.loading$.subscribe(loading => {
        loadingStates.push(loading);
      });

      facade.loadAllData();

      const req = httpMock.expectOne(`${environment.apiUrl}/dashboard/stats`);
      req.flush(mockStats);

      expect(loadingStates).toContain(true);
      expect(loadingStates[loadingStates.length - 1]).toBe(false);
    });
  });
});
