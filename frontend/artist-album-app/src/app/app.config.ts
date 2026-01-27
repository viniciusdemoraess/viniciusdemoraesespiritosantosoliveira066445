import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from '@app/app.routes';
import { jwtInterceptor } from '@core/interceptors/jwt.interceptor';
import { errorInterceptor } from '@core/interceptors/error.interceptor';
import { rateLimitInterceptor } from '@core/interceptors/rate-limit.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([jwtInterceptor, errorInterceptor, rateLimitInterceptor])
    )
  ]
};
