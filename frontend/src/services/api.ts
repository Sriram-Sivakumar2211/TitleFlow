import { 
  User, Property, Transaction, DocumentRecord, 
  RiskFinding, DashboardStats, ExtractionResult 
} from '../types';

const API_BASE = '/api/v1';

function getAuthHeaders(isFormData: boolean = false): HeadersInit {
  const token = localStorage.getItem('titleflow_token');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = `Request failed with status ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson && errJson.detail) {
        if (typeof errJson.detail === 'string') {
          errorDetail = errJson.detail;
        } else if (Array.isArray(errJson.detail)) {
          errorDetail = errJson.detail.map((e: any) => e.msg || e.message).join(', ');
        }
      } else if (errJson && errJson.message) {
        errorDetail = errJson.message;
      }
    } catch (_) {
      try {
        const text = await res.text();
        if (text) errorDetail = `${errorDetail}: ${text.slice(0, 150)}`;
      } catch (__) {}
    }
    throw new Error(errorDetail);
  }
  return res.json();
}

export const api = {
  // Auth
  async login(credentials: { email: string; password: string }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse<{ access_token: string; token_type: string; user: User }>(res);
  },

  async register(data: { email: string; password: string; full_name: string; role: string; phone?: string }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<User>(res);
  },

  async onboard(payload: any) {
    const res = await fetch(`${API_BASE}/organizations/onboarding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<{
      access_token: string;
      token_type: string;
      user_id: string;
      user_email: string;
      full_name: string;
      organization_id: string;
      organization_name: string;
      org_type: string;
    }>(res);
  },

  async getCurrentOrganization() {
    const res = await fetch(`${API_BASE}/organizations/current`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<User>(res);
  },

  async logout() {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    localStorage.removeItem('titleflow_token');
    localStorage.removeItem('titleflow_user');
  },

  // Dashboard
  async getDashboardStats() {
    const res = await fetch(`${API_BASE}/dashboard/stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<DashboardStats>(res);
  },

  // Properties
  async getProperties(search?: string) {
    const url = new URL(`${window.location.origin}${API_BASE}/properties`);
    if (search) url.searchParams.set('search', search);
    const res = await fetch(url.toString(), { headers: getAuthHeaders() });
    return handleResponse<Property[]>(res);
  },

  async getProperty(id: string) {
    const res = await fetch(`${API_BASE}/properties/${id}`, { headers: getAuthHeaders() });
    return handleResponse<Property>(res);
  },

  async createProperty(data: Partial<Property>) {
    const res = await fetch(`${API_BASE}/properties`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Property>(res);
  },

  // Transactions
  async getTransactions(params?: { status?: string; search?: string }) {
    const url = new URL(`${window.location.origin}${API_BASE}/transactions`);
    if (params?.status) url.searchParams.set('status', params.status);
    if (params?.search) url.searchParams.set('search', params.search);
    const res = await fetch(url.toString(), { headers: getAuthHeaders() });
    return handleResponse<Transaction[]>(res);
  },

  async getTransaction(id: string) {
    const res = await fetch(`${API_BASE}/transactions/${id}`, { headers: getAuthHeaders() });
    return handleResponse<Transaction>(res);
  },

  async createTransaction(data: any) {
    const res = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Transaction>(res);
  },

  async updateTransaction(id: string, data: any) {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Transaction>(res);
  },

  async evaluateTransactionRisks(id: string) {
    const res = await fetch(`${API_BASE}/transactions/${id}/evaluate-risks`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ message: string; findings_count: number }>(res);
  },

  // Documents
  async uploadDocument(formData: FormData) {
    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: formData,
    });
    return handleResponse<DocumentRecord>(res);
  },

  async getTransactionDocuments(transactionId: string) {
    const res = await fetch(`${API_BASE}/documents/transaction/${transactionId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<DocumentRecord[]>(res);
  },

  async getDocument(id: string) {
    const res = await fetch(`${API_BASE}/documents/${id}`, { headers: getAuthHeaders() });
    return handleResponse<DocumentRecord>(res);
  },

  getDocumentDownloadUrl(id: string) {
    return `${API_BASE}/documents/${id}/download`;
  },

  async reprocessDocument(id: string) {
    const res = await fetch(`${API_BASE}/documents/${id}/reprocess`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse<DocumentRecord>(res);
  },

  async verifyExtraction(documentId: string, payload: { is_verified: boolean; updated_fields?: any }) {
    const res = await fetch(`${API_BASE}/documents/${documentId}/extraction/verify`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<ExtractionResult>(res);
  },

  async deleteDocument(id: string) {
    const res = await fetch(`${API_BASE}/documents/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ message: string }>(res);
  },

  // Risks
  async getTransactionRisks(transactionId: string) {
    const res = await fetch(`${API_BASE}/risks/transaction/${transactionId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<RiskFinding[]>(res);
  },

  async reviewRiskFinding(findingId: string, payload: { review_status: string; resolution_notes?: string }) {
    const res = await fetch(`${API_BASE}/risks/${findingId}/review`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<RiskFinding>(res);
  },

  // Users
  async getUsers(role?: string) {
    const url = new URL(`${window.location.origin}${API_BASE}/users`);
    if (role) url.searchParams.set('role', role);
    const res = await fetch(url.toString(), { headers: getAuthHeaders() });
    return handleResponse<User[]>(res);
  },
};
