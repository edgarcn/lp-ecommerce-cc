import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { BatchUploadResult, ProductService } from '../../../../core/services/product.service';

@Component({
  selector: 'app-admin-batch-upload',
  imports: [RouterLink],
  templateUrl: './admin-batch-upload.html',
  styleUrl: './admin-batch-upload.css',
})
export class AdminBatchUpload {
  private readonly productService = inject(ProductService);
  private readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  readonly file = signal<File | null>(null);
  readonly uploading = signal(false);
  readonly result = signal<BatchUploadResult | null>(null);
  readonly requestError = signal<string | null>(null);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.file.set(input.files?.[0] ?? null);
    this.result.set(null);
    this.requestError.set(null);
  }

  upload(): void {
    const file = this.file();
    if (!file) return;
    if (!confirm(`Upload "${file.name}" and apply product changes? This cannot be undone.`)) return;

    this.uploading.set(true);
    this.result.set(null);
    this.requestError.set(null);

    this.productService.batchUpload(file).subscribe({
      next: (res) => {
        this.result.set(res);
        this.file.set(null);
        this.fileInput().nativeElement.value = '';
        this.uploading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        // Browser aborts the request with status 0 and a ProgressEvent error
        // when the file was modified on disk after it was selected.
        if (err.status === 0 && err.error instanceof ProgressEvent) {
          this.requestError.set(
            'The file was modified after it was selected. Please choose the file again before uploading.'
          );
          this.file.set(null);
          this.fileInput().nativeElement.value = '';
          this.uploading.set(false);
          return;
        }
        // The API returns the result body (with errors) on a 400 too.
        if (err?.error && Array.isArray(err.error.errors)) {
          this.result.set(err.error as BatchUploadResult);
        } else {
          this.requestError.set(err?.error?.message ?? 'Upload failed. Please try again.');
        }
        this.uploading.set(false);
      },
    });
  }

  reset(): void {
    this.file.set(null);
    this.result.set(null);
    this.requestError.set(null);
    this.fileInput().nativeElement.value = '';
  }

  get succeeded(): boolean {
    const r = this.result();
    return !!r && r.errors.length === 0;
  }
}
