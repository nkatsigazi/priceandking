import api from '../api';
import type { Client } from '../types/client';

export const fetchClients = async (): Promise<Client[]> => {
  const res = await api.get<Client[]>('crm/clients/');
  return res.data;
};

export const createClient = async (payload: Partial<Client>) => {
  return api.post('crm/clients/', payload);
};