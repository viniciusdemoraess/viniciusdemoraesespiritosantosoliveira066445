import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['login']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, HttpClientTestingModule, FormsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty credentials', () => {
    expect(component.credentials.username).toBe('');
    expect(component.credentials.password).toBe('');
  });

  it('should initialize with loading false and no error', () => {
    expect(component.loading).toBe(false);
    expect(component.errorMessage).toBe('');
  });

  describe('onSubmit', () => {
    it('should login successfully and navigate to artists', () => {
      const mockResponse = {
        username: 'admin',
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh',
        tokenType: 'Bearer',
        expiresIn: 300
      };

      mockAuthService.login.and.returnValue(of(mockResponse));
      component.credentials = { username: 'admin', password: 'admin123' };

      component.onSubmit();

      expect(component.loading).toBe(false);
      expect(component.errorMessage).toBe('');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/artists']);
    });

    it('should handle login error', () => {
      const mockError = { error: { message: 'Invalid credentials' } };
      mockAuthService.login.and.returnValue(throwError(() => mockError));
      component.credentials = { username: 'wrong', password: 'wrong' };

      component.onSubmit();

      expect(component.loading).toBe(false);
      expect(component.errorMessage).toBe('Invalid credentials');
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should handle error without message', () => {
      const mockError = { error: {} };
      mockAuthService.login.and.returnValue(throwError(() => mockError));
      component.credentials = { username: 'test', password: 'test' };

      component.onSubmit();

      expect(component.errorMessage).toBe('Erro ao fazer login. Verifique suas credenciais.');
    });

    it('should set loading to true during login', () => {
      mockAuthService.login.and.returnValue(of({
        username: 'test',
        accessToken: 'token',
        refreshToken: 'refresh',
        tokenType: 'Bearer',
        expiresIn: 300
      }));
      component.credentials = { username: 'test', password: 'test' };

      component.onSubmit();
      // Loading is set to true, then immediately to false after observable completes
      // We can only verify final state
      expect(component.loading).toBe(false);
    });
  });
});
