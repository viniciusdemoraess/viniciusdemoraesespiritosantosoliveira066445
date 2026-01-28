import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Album, Page } from '@core/models';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AlbumService {
  private apiUrl = `${environment.apiUrl}/albums`;

  constructor(private http: HttpClient) {}

  getAllAlbums(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'title',
    sortDirection: string = 'asc',
    artistId?: number,
    title?: string
  ): Observable<Page<Album>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    if (artistId) {
      params = params.set('artistId', artistId.toString());
    }

    if (title) {
      params = params.set('title', title);
    }

    return this.http.get<Page<Album>>(this.apiUrl, { params });
  }

  getAlbumById(id: number): Observable<Album> {
    return this.http.get<Album>(`${this.apiUrl}/${id}`);
  }

  createAlbum(album: { 
    title: string; 
    releaseYear: number; 
    genre?: string;
    recordLabel?: string;
    totalTracks?: number;
    totalDurationSeconds?: number;
    artistId?: number;  // Legacy support
    artistIds?: number[]; // New N:N support
  }): Observable<Album> {
    return this.http.post<Album>(this.apiUrl, album);
  }

  updateAlbum(id: number, album: { 
    title: string; 
    releaseYear: number; 
    genre?: string;
    recordLabel?: string;
    totalTracks?: number;
    totalDurationSeconds?: number;
    artistId?: number;  // Legacy support
    artistIds?: number[]; // New N:N support
  }): Observable<Album> {
    return this.http.put<Album>(`${this.apiUrl}/${id}`, album);
  }

  deleteAlbum(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  uploadCovers(albumId: number, files: File[]): Observable<Album> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    return this.http.post<Album>(`${this.apiUrl}/${albumId}/covers`, formData);
  }
}
