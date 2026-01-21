import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card p-4 fade-in mt-6">
      <div class="flex items-center justify-between">
        <p class="text-gray-600 text-sm">
          Mostrando <span class="font-semibold text-gray-900">{{ startItem }}</span> até
          <span class="font-semibold text-gray-900">{{ endItem }}</span> de
          <span class="font-semibold text-gray-900">{{ totalItems }}</span> resultados
          <span *ngIf="searchInfo" class="ml-2 text-gray-500">{{ searchInfo }}</span>
        </p>
        <div class="flex space-x-2">
          <button
            [disabled]="currentPage === 0"
            (click)="onPrevious()"
            class="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <button
            [disabled]="currentPage >= totalPages - 1"
            (click)="onNext()"
            class="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  `
})
export class PaginationComponent {
  @Input() currentPage: number = 0;
  @Input() pageSize: number = 10;
  @Input() totalItems: number = 0;
  @Input() searchInfo?: string;
  @Output() pageChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  get startItem(): number {
    return this.totalItems === 0 ? 0 : this.currentPage * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.totalItems);
  }

  onPrevious(): void {
    if (this.currentPage > 0) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }

  onNext(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }
}
