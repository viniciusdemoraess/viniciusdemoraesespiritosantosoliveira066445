import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Artist, Page } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ArtistService {
  private apiUrl = `${environment.apiUrl}/artists`;

  constructor(private http: HttpClient) {}

  getAllArtists(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'name',
    sortDirection: string = 'asc',
    name?: string
  ): Observable<Page<Artist>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    if (name) {
      params = params.set('name', name);
    }

    return this.http.get<Page<Artist>>(this.apiUrl, { params });
  }

  getArtistById(id: number): Observable<Artist> {
    return this.http.get<Artist>(`${this.apiUrl}/${id}`);
  }

  createArtist(name: string): Observable<Artist> {
    return this.http.post<Artist>(this.apiUrl, { name });
  }

  updateArtist(id: number, name: string): Observable<Artist> {
    return this.http.put<Artist>(`${this.apiUrl}/${id}`, { name });
  }

  deleteArtist(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
