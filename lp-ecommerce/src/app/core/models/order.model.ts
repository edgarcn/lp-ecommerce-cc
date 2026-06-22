export enum OrderStatus {
  Open = 1,
  Cancelled = 2,
  Delivered = 3,
}

export enum PaymentMethod {
  Card = 1,
  PayPal = 2,
}

export interface CreateOrderRequest {
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  deliveryAddress: DeliveryAddressRequest;
  payment: PaymentRequest;
  orderLines: OrderLineRequest[];
}

export interface DeliveryAddressRequest {
  fullname: string;
  countryRegion: string;
  streetAddress: string;
  unitSuiteNumber?: string;
  city: string;
  state: string;
  zipCode: string;
  deliveryInstructions?: string;
}

export interface PaymentRequest {
  method: PaymentMethod;
  cardholderName: string;
  cardNumber: string;
}

export interface OrderLineRequest {
  productId: number;
  quantity: number;
}

export interface OrderDto {
  orderId: number;
  placedDate: string;
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  orderStatus: OrderStatus;
  deliveryAddress: DeliveryAddressRequest;
  payment: PaymentInfo | null;
  shippingInfo: { shippingServiceName: string; trackingNumber: string } | null;
  orderLines: OrderLineDto[];
  total: number;
}

export interface PaymentInfo {
  method: PaymentMethod;
  status: number;
  cardBrand: string;
  cardLast4: string;
  cardholderName: string;
  amountPaid: number;
  currency: string;
  transactionReference: string;
  processedAt: string;
}

export interface OrderLineDto {
  orderLineId: number;
  productId: number;
  productName: string;
  productSku: string;
  quantity: number;
  basePrice: number;
  discount: number;
  totalLine: number;
}

// Privacy-minimal order view returned by the public customer "track order"
// lookup. Excludes payment metadata and the full delivery address.
export interface CustomerOrderView {
  orderId: number;
  placedDate: string;
  customerFirstName: string;
  orderStatus: OrderStatus;
  shipToCity: string;
  shipToState: string;
  shipToCountryRegion: string;
  shippingInfo: { shippingServiceName: string; trackingNumber: string } | null;
  orderLines: OrderLineDto[];
  total: number;
}
