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
    path: 'artists',
    loadComponent: () => import('./features/artists/components/artist-list.component')
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
    path: '**',
    redirectTo: '/auth/login'
  }
];
