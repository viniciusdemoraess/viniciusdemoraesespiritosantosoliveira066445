import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/components/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/components/dashboard.component')
      .then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'artists/:id/edit',
    loadComponent: () => import('./features/artists/components/artist-edit/artist-edit.component')
      .then(m => m.ArtistEditComponent),
    canActivate: [authGuard]
  },
  {
    path: 'artists/:id',
    loadComponent: () => import('./features/artists/components/artist-details/artist-detail.component')
      .then(m => m.ArtistDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'artists',
    loadComponent: () => import('./features/artists/components/artist-list/artist-list.component')
      .then(m => m.ArtistListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'albums',
    loadComponent: () => import('./features/albums/components/album-list/album-list.component')
      .then(m => m.AlbumListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'albums/create',
    loadComponent: () => import('./features/albums/components/album-create/album-create.component')
      .then(m => m.AlbumCreateComponent),
    canActivate: [authGuard]
  },
  {
    path: 'albums/:id/edit',
    loadComponent: () => import('./features/albums/components/album-edit/album-edit.component')
      .then(m => m.AlbumEditComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];
