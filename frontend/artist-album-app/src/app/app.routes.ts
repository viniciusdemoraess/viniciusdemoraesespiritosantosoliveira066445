import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/components/login.component';
import { ArtistListComponent } from './features/artists/components/artist-list.component';
import { AlbumListComponent } from './features/albums/components/album-list/album-list.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth/login',
    component: LoginComponent
  },
  {
    path: 'artists',
    component: ArtistListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'albums',
    component: AlbumListComponent,
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];
