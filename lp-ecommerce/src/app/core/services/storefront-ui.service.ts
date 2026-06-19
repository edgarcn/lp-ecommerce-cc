import { Injectable, signal } from '@angular/core';
import { SearchCriteria } from '../../shared/components/header/header';

@Injectable({ providedIn: 'root' })
export class StorefrontUiService {
  readonly paneOpen = signal(false);
  readonly categories = signal<string[]>([]);
  readonly showSearch = signal(true);
  readonly search = signal<SearchCriteria>({ term: '', category: '' });

  openPane(): void { this.paneOpen.set(true); }
  closePane(): void { this.paneOpen.set(false); }
  setCategories(categories: string[]): void { this.categories.set(categories); }
  setShowSearch(show: boolean): void { this.showSearch.set(show); }
  setSearch(criteria: SearchCriteria): void { this.search.set(criteria); }
}
