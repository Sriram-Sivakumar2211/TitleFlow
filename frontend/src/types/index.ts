export type UserRole = 'ADMIN' | 'CLOSING_AGENT' | 'BUYER' | 'SELLER';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type PropertyType = 
  | 'SINGLE_FAMILY' 
  | 'CONDOMINIUM' 
  | 'TOWNHOUSE' 
  | 'MULTI_FAMILY' 
  | 'COMMERCIAL' 
  | 'VACANT_LAND';

export interface Property {
  id: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  county?: string;
  property_type: PropertyType | string;
  apn_pin?: string;
  legal_description?: string;
  year_built?: number;
  created_at: string;
  updated_at: string;
}

export type TransactionStatus = 
  | 'DRAFT' 
  | 'DOCUMENTS_PENDING' 
  | 'UNDER_REVIEW' 
  | 'READY_FOR_CLOSING' 
  | 'COMPLETED' 
  | 'ON_HOLD';

export interface Transaction {
  id: string;
  transaction_number: string;
  property_id: string;
  closing_agent_id?: string;
  buyer_id?: string;
  seller_id?: string;
  status: TransactionStatus;
  purchase_price?: number;
  earnest_money_deposit?: number;
  escrow_account_number?: string;
  estimated_closing_date?: string;
  actual_closing_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  property: Property;
  closing_agent?: User;
  buyer?: User;
  seller?: User;
  document_count?: number;
  risk_finding_count?: number;
}

export type DocumentCategory = 
  | 'PROPERTY_DEED' 
  | 'TITLE_REPORT' 
  | 'MORTGAGE_DOCUMENT' 
  | 'LIEN_DOCUMENT' 
  | 'TAX_RECORD' 
  | 'PURCHASE_AGREEMENT' 
  | 'OTHER';

export type DocumentProcessingStatus = 
  | 'UPLOADED' 
  | 'PROCESSING' 
  | 'PROCESSED' 
  | 'FAILED' 
  | 'NEEDS_REVIEW';

export interface ExtractedFieldItem {
  value?: any;
  confidence: number;
  source_page?: number;
  source_text_snippet?: string;
  review_status: 'UNVERIFIED' | 'VERIFIED' | 'FLAGGED';
}

export interface DocumentExtractionSchema {
  document_type: string;
  document_title?: string;
  property_address: ExtractedFieldItem;
  seller_names: ExtractedFieldItem;
  buyer_names: ExtractedFieldItem;
  parcel_pin: ExtractedFieldItem;
  legal_description: ExtractedFieldItem;
  recording_info: ExtractedFieldItem;
  document_date: ExtractedFieldItem;
  mortgage_info: ExtractedFieldItem;
  lien_references: ExtractedFieldItem;
  financial_amounts: ExtractedFieldItem;
  additional_notes?: string;
}

export interface ExtractionResult {
  id: string;
  document_id: string;
  provider: string;
  classification_confidence: number;
  raw_text?: string;
  extracted_data: DocumentExtractionSchema | Record<string, ExtractedFieldItem>;
  status: string;
  is_verified: boolean;
  verified_by_id?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentRecord {
  id: string;
  transaction_id: string;
  uploaded_by_id: string;
  filename: string;
  original_filename: string;
  file_size_bytes: number;
  mime_type: string;
  category: DocumentCategory;
  processing_status: DocumentProcessingStatus;
  page_count?: number;
  ocr_applied: boolean;
  error_message?: string;
  created_at: string;
  updated_at: string;
  uploaded_by?: User;
  extraction_result?: ExtractionResult;
}

export type RiskSeverity = 
  | 'INFORMATIONAL' 
  | 'NEEDS_REVIEW' 
  | 'POTENTIAL_INCONSISTENCY' 
  | 'HIGH_PRIORITY_REVIEW';

export type FindingReviewStatus = 
  | 'OPEN' 
  | 'ACKNOWLEDGED' 
  | 'RESOLVED' 
  | 'DISMISSED';

export interface RiskFinding {
  id: string;
  transaction_id: string;
  document_id?: string;
  title: string;
  description: string;
  reason: string;
  category: string;
  severity: RiskSeverity;
  review_status: FindingReviewStatus;
  resolution_notes?: string;
  resolved_by_id?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  resolved_by?: User;
  document?: DocumentRecord;
}

export interface RecentActivityItem {
  id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  description: string;
  timestamp: string;
  user_name?: string;
}

export interface DashboardStats {
  total_properties: number;
  active_transactions: number;
  pending_documents: number;
  documents_processed: number;
  transactions_awaiting_review: number;
  high_priority_risks_count: number;
  status_breakdown: Record<string, number>;
  recent_activity: RecentActivityItem[];
  recent_transactions: Transaction[];
}
