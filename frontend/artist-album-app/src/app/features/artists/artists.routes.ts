import { Routes } from '@angular/router';
import { ArtistListComponent } from './components/artist-list.component';

export const ARTISTS_ROUTES: Routes = [
  {
    path: '',
    component: ArtistListComponent
  }
];
