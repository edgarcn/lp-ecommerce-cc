import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-host',
  template: `
    <div class="toast-host">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [class]="toast.type" (click)="toastService.dismiss(toast.id)">
          {{ toast.message }}
        </div>
      }
    </div>
  `,
  styles: [
    `
      .toast-host {
        position: fixed;
        top: 84px;
        right: 24px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 360px;
      }
      .toast {
        padding: 13px 16px;
        border-radius: var(--radius-sm);
        background: #fff;
        box-shadow: var(--shadow-md);
        font-size: 0.9rem;
        border-left: 4px solid var(--color-text-muted);
        cursor: pointer;
        animation: slide-in 0.18s ease;
      }
      .toast.success { border-left-color: var(--color-success); }
      .toast.warning { border-left-color: #d97706; }
      .toast.error { border-left-color: var(--color-danger); }
      .toast.info { border-left-color: var(--color-primary); }
      @keyframes slide-in {
        from { transform: translateX(20px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `,
  ],
})
export class ToastHost {
  readonly toastService = inject(ToastService);
}
