export interface CartItem {
  productId: number;
  sku: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CheckoutDraft {
  shipment?: {
    email: string;
    firstName: string;
    lastName: string;
    countryRegion: string;
    streetAddress: string;
    unitSuiteNumber?: string;
    city: string;
    state: string;
    zipCode: string;
    deliveryInstructions?: string;
  };
  payment?: {
    cardNumber: string;
    cardholderName: string;
    expiry: string;
  };
}
