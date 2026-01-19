export interface ClientContact {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  is_primary: boolean;
}

export interface Client {
  id: number;
  name: string;
  tax_id_number: string;
  entity_type: string;
  industry?: string;
  partner?: { username: string };
  fiscal_year_end?: string;
  is_active: boolean;
  contacts: ClientContact[];
}