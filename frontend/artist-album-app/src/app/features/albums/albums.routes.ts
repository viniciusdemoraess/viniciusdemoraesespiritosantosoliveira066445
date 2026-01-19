import { Routes } from '@angular/router';
import { AlbumListComponent } from './components/album-list/album-list.component';

export const ALBUMS_ROUTES: Routes = [
  {
    path: '',
    component: AlbumListComponent
  }
];
