import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { AuthService } from '@core/services/auth.service';
import { of } from 'rxjs';

describe('authGuard', () => {
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    });
  });

  it('should allow access when user is authenticated', () => {
    mockAuthService.isLoggedIn.and.returnValue(true);

    const canActivate = TestBed.runInInjectionContext(() => {
      return authGuard();
    });

    expect(canActivate).toBe(true);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to login when user is not authenticated', () => {
    mockAuthService.isLoggedIn.and.returnValue(false);

    const canActivate = TestBed.runInInjectionContext(() => {
      return authGuard();
    });

    expect(canActivate).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
  });
});
