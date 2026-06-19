import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StorefrontUiService } from '../../../core/services/storefront-ui.service';

@Component({
  selector: 'app-order-complete',
  imports: [RouterLink],
  templateUrl: './order-complete.html',
  styleUrl: './order-complete.css',
})
export class OrderComplete {
  private readonly route = inject(ActivatedRoute);
  private readonly ui = inject(StorefrontUiService);

  readonly orderId = this.route.snapshot.paramMap.get('id');

  constructor() {
    this.ui.setShowSearch(true);
  }
}
