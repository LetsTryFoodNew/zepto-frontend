export interface Address {
  storeAddress: string;
  vendorAddress: string;
  vendorPinCode: string;
  storeBillingAddress: string;
  storeShippingAddress: string;
}

export interface FinancialDetails {
  entityPAN: string;
  vendorPAN: string;
  entityGSTIN: string;
  vendorGSTIN: string;
}

export interface POLineItem {
  costPrice: any;
  ean: string;
  materialCode: string;
  skuCode: string;
  productName: string;
  quantity: number;
  mrp: number;
  totalAmount: number;
}

export interface PurchaseOrderDetails {
  code: string;
  timestamp: string;
  eventType: string;
  vendorCode: string;
  toStoreCode: string;
  status: string;
  type: string;
  vendorName: string;
  toStoreName: string;
  deliveryDate: string;
  expiryDate: string;
  totalQty: number;
  cityId: string;
  pdfFileName: string;
  address: Address;
  financialDetails: FinancialDetails;
  poLineItems: POLineItem[];
  expiringUrlForPoPDF: string | null;
}

export interface PurchaseOrder {
  code: string;
  eventType: string;
  status: string;
  vendorName: string;
  vendorCode: string;
  toStoreCode: string;
  toStoreName: string;
  timestamp: string;      
  expiryDate: string;     
  deliveryDate: string;   
  totalQty: number;
  cityId: string;
  expiringUrlForPoPDF: string | null;
}

export interface POListResponse{
  purchaseOrders: PurchaseOrder[];
  hasNext: boolean;
  pageNumber: number;
  pageSize: number;
}


