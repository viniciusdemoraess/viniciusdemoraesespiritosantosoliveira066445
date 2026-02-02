import { Routes } from '@angular/router';
import { ArtistListComponent } from '@app/features/artists/components/artist-list/artist-list.component';

export const ARTISTS_ROUTES: Routes = [
  {
    path: '',
    component: ArtistListComponent
  }
];
