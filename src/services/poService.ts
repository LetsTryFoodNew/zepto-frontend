// src/services/poService.ts
import api from './api';
import { POListResponse, PurchaseOrder, PurchaseOrderDetails } from '../types';

export interface GetPoEventsParams {
  days?: number;
  vendorCodes?: string;
  poCodes?: string;
  includeAllPoEvents?: boolean;
  includeLineItemDetails?: boolean;
  page_size?: number;
  page_number?: number;
}

// This returns PO list response with pagination fields
export async function getPoList(params: GetPoEventsParams): Promise<POListResponse> {
  const response = await api.get('/po', { params });
  // response.data.data conforms to POListResponse (purchaseOrders[], hasNext, pageNumber, pageSize)
  return response.data.data as POListResponse;
}

// To get detailed PO information for particular code (including line items)
export async function getPoDetails(poCode: string): Promise<PurchaseOrderDetails | null> {
  const response = await api.get('/po/details', {
    params: { poCodes: poCode, includeLineItemDetails: true }
  });

  const poDetailsList = response.data.data.purchaseOrders as PurchaseOrderDetails[] | undefined;

  // Return first if exists, else null
  return poDetailsList && poDetailsList.length > 0 ? poDetailsList[0] : null;
}

export async function amendPo(poCode: string, amendmentBody: any){
  const response = await api.post(`/po/${poCode}/amendment`, amendmentBody);
  return response.data;
}