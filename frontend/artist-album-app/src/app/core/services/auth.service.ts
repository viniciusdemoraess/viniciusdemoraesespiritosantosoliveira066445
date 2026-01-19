import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { AuthResponse, LoginRequest } from '../models';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/v1/auth';
  private currentUserSubject = new BehaviorSubject<string | null>(this.getUsername());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.setSession(response);
        this.currentUserSubject.next(response.username);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    localStorage.removeItem('tokenExpiration');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh?refreshToken=${refreshToken}`, {}).pipe(
      tap(response => {
        this.setSession(response);
      })
    );
  }

  private setSession(authResponse: AuthResponse): void {
    const expiresAt = new Date().getTime() + (authResponse.expiresIn * 1000);
    localStorage.setItem('accessToken', authResponse.accessToken);
    localStorage.setItem('refreshToken', authResponse.refreshToken);
    localStorage.setItem('username', authResponse.username);
    localStorage.setItem('tokenExpiration', expiresAt.toString());
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  isLoggedIn(): boolean {
    const token = this.getAccessToken();
    const expiration = localStorage.getItem('tokenExpiration');

    if (!token || !expiration) {
      return false;
    }

    const now = new Date().getTime();
    return now < parseInt(expiration);
  }

  isTokenExpiringSoon(): boolean {
    const expiration = localStorage.getItem('tokenExpiration');
    if (!expiration) return false;

    const now = new Date().getTime();
    const expirationTime = parseInt(expiration);
    const timeUntilExpiration = expirationTime - now;

    // Token expires in less than 60 seconds
    return timeUntilExpiration < 60000 && timeUntilExpiration > 0;
  }
}
