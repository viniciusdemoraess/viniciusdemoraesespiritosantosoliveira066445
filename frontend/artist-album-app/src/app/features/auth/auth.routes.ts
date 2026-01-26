import { Routes } from '@angular/router';
import { LoginComponent } from '@features/auth/components/login.component';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    component: LoginComponent
  }
];
