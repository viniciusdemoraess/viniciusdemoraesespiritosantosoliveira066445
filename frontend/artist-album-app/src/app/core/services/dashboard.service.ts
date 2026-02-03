import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface DashboardStats {
  totalArtists: number;
  totalAlbums: number;
  averageAlbumsPerArtist: number;
  artistsWithoutAlbums: number;
  albumsWithCovers: number;
  albumsWithoutCovers: number;
  recentAlbums: RecentAlbum[];
}

export interface RecentAlbum {
  id: number;
  title: string;
  artistNames: string;
  releaseYear: number;
  totalTracks?: number;
  genre?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }
}
