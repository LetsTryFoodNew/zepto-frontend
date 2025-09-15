import api from './api';

export async function createAsn(body: any) {
  const response = await api.post('/asn', body);
  return response.data;
}

export async function getAsnListByPoNumber(poNumber: string) {
  const response = await api.get('/asn', {
    params: { po_number: poNumber },
  });
  return response.data;
}


export async function cancelAsn(asnNumber: string) {
  const response = await api.delete('/asn', {
    data: { asnNumber },
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
}
