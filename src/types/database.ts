export interface Profile {
  id: string;
  email: string;
  business_name: string;
  logo_url: string | null;
  primary_color: string;
  created_at: string;
}

export interface Client {
  id: string;
  provider_id: string;
  name: string;
  email: string;
  company: string | null;
  status: 'active' | 'archived';
  project_status: string;
  created_at: string;
}

export interface SharedFile {
  id: string;
  client_id: string;
  uploaded_by: 'provider' | 'client';
  file_name: string;
  file_url: string;
  file_size: number;
  created_at: string;
}

export interface Message {
  id: string;
  client_id: string;
  sender: 'provider' | 'client';
  content: string;
  created_at: string;
}

export interface DocumentRequest {
  id: string;
  client_id: string;
  title: string;
  items: DocumentRequestItem[];
  created_at: string;
}

export interface DocumentRequestItem {
  id: string;
  label: string;
  completed: boolean;
  file_url: string | null;
  file_name: string | null;
}

export interface IntakeForm {
  id: string;
  provider_id: string;
  title: string;
  fields: IntakeFormField[];
  created_at: string;
}

export interface IntakeFormField {
  id: string;
  type: 'text' | 'textarea' | 'email' | 'select' | 'file';
  label: string;
  required: boolean;
  options?: string[];
}

export interface IntakeResponse {
  id: string;
  form_id: string;
  client_id: string;
  responses: Record<string, string>;
  created_at: string;
}

export interface PaymentLink {
  id: string;
  client_id: string;
  amount: number;
  description: string;
  status: 'pending' | 'paid';
  stripe_url: string | null;
  created_at: string;
  paid_at: string | null;
}

export interface Activity {
  id: string;
  client_id: string;
  actor: 'provider' | 'client' | 'system';
  action: string;
  details: string | null;
  created_at: string;
}
