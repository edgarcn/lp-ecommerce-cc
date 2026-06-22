import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { StorefrontUiService } from '../../../core/services/storefront-ui.service';

export interface SearchCriteria {
  term: string;
  category: string;
}

@Component({
  selector: 'app-header',
  imports: [FormsModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  readonly cart = inject(CartService);
  readonly ui = inject(StorefrontUiService);
  private readonly router = inject(Router);

  readonly term = signal('');
  readonly category = signal('');

  onSubmit(): void {
    this.ui.setSearch({ term: this.term().trim(), category: this.category() });
    this.router.navigate(['/']);
  }

  onCategoryChange(value: string): void {
    this.category.set(value);
    this.onSubmit();
  }

  goHome(): void {
    this.term.set('');
    this.category.set('');
    this.ui.setSearch({ term: '', category: '' });
  }
}
