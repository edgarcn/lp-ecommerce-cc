import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-offline',
  templateUrl: './offline.html',
  styleUrl: './offline.css',
})
export class Offline {
  private readonly router = inject(Router);

  retry(): void {
    this.router.navigate(['/']);
  }
}
