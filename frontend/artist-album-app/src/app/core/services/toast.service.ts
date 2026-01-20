import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts: Subject<Toast> = new Subject<Toast>();
  private idCounter = 0;

  getToasts(): Observable<Toast> {
    return this.toasts.asObservable();
  }

  show(message: string, type: Toast['type'] = 'info', duration: number = 5000) {
    const toast: Toast = {
      id: ++this.idCounter,
      message,
      type,
      duration
    };
    this.toasts.next(toast);
  }

  success(message: string) {
    this.show(message, 'success');
  }

  error(message: string) {
    this.show(message, 'error');
  }

  warning(message: string) {
    this.show(message, 'warning');
  }

  info(message: string) {
    this.show(message, 'info');
  }
}
