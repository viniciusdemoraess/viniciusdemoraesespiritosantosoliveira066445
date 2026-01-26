import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;
  const mockRouter = {
    navigate: jasmine.createSpy('navigate')
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: mockRouter }
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('login', () => {
    it('should login successfully and store tokens', (done) => {
      const mockCredentials = { username: 'admin', password: 'admin123' };
      const mockResponse = {
        username: 'admin',
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 300
      };

      service.login(mockCredentials).subscribe(response => {
        expect(response.username).toBe('admin');
        expect(localStorage.getItem('accessToken')).toBe('mock-access-token');
        expect(localStorage.getItem('refreshToken')).toBe('mock-refresh-token');
        done();
      });

      const req = httpMock.expectOne('http://localhost:8080/api/v1/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockCredentials);
      req.flush(mockResponse);
    });

    it('should handle login error', (done) => {
      const mockCredentials = { username: 'wrong', password: 'wrong' };

      service.login(mockCredentials).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(401);
          expect(localStorage.getItem('accessToken')).toBeNull();
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8080/api/v1/auth/login');
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('logout', () => {
    it('should clear tokens and navigate to login', () => {
      localStorage.setItem('accessToken', 'test-token');
      localStorage.setItem('refreshToken', 'test-refresh');
      localStorage.setItem('username', 'test');

      service.logout();

      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(localStorage.getItem('username')).toBeNull();
      expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
    });
  });

  describe('refreshToken', () => {
    it('should refresh access token successfully', (done) => {
      localStorage.setItem('refreshToken', 'old-refresh-token');
      const mockResponse = {
        username: 'admin',
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 300
      };

      service.refreshToken().subscribe(response => {
        expect(response.accessToken).toBe('new-access-token');
        expect(localStorage.getItem('accessToken')).toBe('new-access-token');
        expect(localStorage.getItem('refreshToken')).toBe('new-refresh-token');
        done();
      });

      const req = httpMock.expectOne('http://localhost:8080/api/v1/auth/refresh?refreshToken=old-refresh-token');
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('token management', () => {
    it('should return access token from localStorage', () => {
      localStorage.setItem('accessToken', 'test-token');
      expect(service.getAccessToken()).toBe('test-token');
    });

    it('should return null if no access token', () => {
      expect(service.getAccessToken()).toBeNull();
    });

    it('should return refresh token from localStorage', () => {
      localStorage.setItem('refreshToken', 'test-refresh-token');
      expect(service.getRefreshToken()).toBe('test-refresh-token');
    });

    it('should check if token is expiring soon', () => {
      // Token expiring in 30 seconds
      const expiration = new Date().getTime() + 30000;
      localStorage.setItem('tokenExpiration', expiration.toString());
      expect(service.isTokenExpiringSoon()).toBe(true);
    });

    it('should check if token is not expiring soon', () => {
      // Token expiring in 5 minutes
      const expiration = new Date().getTime() + 300000;
      localStorage.setItem('tokenExpiration', expiration.toString());
      expect(service.isTokenExpiringSoon()).toBe(false);
    });
  });

  describe('isLoggedIn', () => {
    it('should return true if user has access token', () => {
      const futureExpiration = new Date().getTime() + 300000; // 5 minutes in future
      localStorage.setItem('accessToken', 'test-token');
      localStorage.setItem('tokenExpiration', futureExpiration.toString());
      expect(service.isLoggedIn()).toBe(true);
    });

    it('should return false if no access token', () => {
      expect(service.isLoggedIn()).toBe(false);
    });
  });
});
