import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../core/services/toast.service';
import { Subscription } from 'rxjs';

interface ToastWithTimeout extends Toast {
  timeoutId?: number;
}

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <div *ngFor="let toast of toasts"
           [ngClass]="{
             'toast': true,
             'toast-success': toast.type === 'success',
             'toast-error': toast.type === 'error',
             'toast-warning': toast.type === 'warning'
           }"
           class="slide-in">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg *ngIf="toast.type === 'success'" class="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
            <svg *ngIf="toast.type === 'error'" class="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
            </svg>
            <svg *ngIf="toast.type === 'warning'" class="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <div class="ml-3 flex-1">
            <p class="text-sm font-medium text-gray-900">
              {{ toast.message }}
            </p>
          </div>
          <button (click)="removeToast(toast.id)" class="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-500">
            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  toasts: ToastWithTimeout[] = [];
  private subscription?: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.subscription = this.toastService.getToasts().subscribe(toast => {
      const toastWithTimeout: ToastWithTimeout = { ...toast };
      this.toasts.push(toastWithTimeout);

      if (toast.duration && toast.duration > 0) {
        const timeoutId = window.setTimeout(() => {
          this.removeToast(toast.id);
        }, toast.duration);
        toastWithTimeout.timeoutId = timeoutId;
      }
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
    this.toasts.forEach(toast => {
      if (toast.timeoutId) {
        clearTimeout(toast.timeoutId);
      }
    });
  }

  removeToast(id: number) {
    const index = this.toasts.findIndex(t => t.id === id);
    if (index !== -1) {
      if (this.toasts[index].timeoutId) {
        clearTimeout(this.toasts[index].timeoutId);
      }
      this.toasts.splice(index, 1);
    }
  }
}
