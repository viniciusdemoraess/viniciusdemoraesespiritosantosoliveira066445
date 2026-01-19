import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { User } from '../models';

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
        user: { id: 1, username: 'admin', email: 'admin@test.com' },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      };

      service.login(mockCredentials).subscribe(response => {
        expect(response.user.username).toBe('admin');
        expect(localStorage.getItem('access_token')).toBe('mock-access-token');
        expect(localStorage.getItem('refresh_token')).toBe('mock-refresh-token');
        expect(service.currentUserValue).toEqual(mockResponse.user);
        done();
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/auth/login`);
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
          expect(localStorage.getItem('access_token')).toBeNull();
          done();
        }
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/auth/login`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('logout', () => {
    it('should clear tokens and navigate to login', () => {
      localStorage.setItem('access_token', 'test-token');
      localStorage.setItem('refresh_token', 'test-refresh');
      service['currentUserSubject'].next({ id: 1, username: 'test', email: 'test@test.com' });

      service.logout();

      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
      expect(service.currentUserValue).toBeNull();
      expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
    });
  });

  describe('refreshToken', () => {
    it('should refresh access token successfully', (done) => {
      localStorage.setItem('refresh_token', 'old-refresh-token');
      const mockResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token'
      };

      service.refreshToken().subscribe(response => {
        expect(response.accessToken).toBe('new-access-token');
        expect(localStorage.getItem('access_token')).toBe('new-access-token');
        expect(localStorage.getItem('refresh_token')).toBe('new-refresh-token');
        done();
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/auth/refresh`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ refreshToken: 'old-refresh-token' });
      req.flush(mockResponse);
    });

    it('should logout on refresh token failure', (done) => {
      localStorage.setItem('refresh_token', 'expired-token');
      spyOn(service, 'logout');

      service.refreshToken().subscribe({
        next: () => fail('should have failed'),
        error: () => {
          expect(service.logout).toHaveBeenCalled();
          done();
        }
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/auth/refresh`);
      req.flush('Token expired', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('token management', () => {
    it('should return access token from localStorage', () => {
      localStorage.setItem('access_token', 'test-token');
      expect(service.getAccessToken()).toBe('test-token');
    });

    it('should return null if no access token', () => {
      expect(service.getAccessToken()).toBeNull();
    });

    it('should return refresh token from localStorage', () => {
      localStorage.setItem('refresh_token', 'test-refresh-token');
      expect(service.getRefreshToken()).toBe('test-refresh-token');
    });

    it('should detect token expiring soon (< 60 seconds)', () => {
      // Token that expires in 30 seconds
      const expiringToken = createMockToken(30);
      localStorage.setItem('access_token', expiringToken);
      expect(service.isTokenExpiringSoon()).toBe(true);
    });

    it('should detect token not expiring soon (> 60 seconds)', () => {
      // Token that expires in 120 seconds
      const validToken = createMockToken(120);
      localStorage.setItem('access_token', validToken);
      expect(service.isTokenExpiringSoon()).toBe(false);
    });

    it('should return true if no token exists', () => {
      expect(service.isTokenExpiringSoon()).toBe(true);
    });
  });

  describe('isAuthenticated', () => {
    it('should return true if user is logged in', () => {
      service['currentUserSubject'].next({ id: 1, username: 'test', email: 'test@test.com' });
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false if no user is logged in', () => {
      service['currentUserSubject'].next(null);
      expect(service.isAuthenticated()).toBe(false);
    });
  });
});

// Helper function to create mock JWT token with specific expiration
function createMockToken(expiresInSeconds: number): string {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + expiresInSeconds;
  const payload = { sub: 'testuser', exp };
  const encodedPayload = btoa(JSON.stringify(payload));
  return `header.${encodedPayload}.signature`;
}
