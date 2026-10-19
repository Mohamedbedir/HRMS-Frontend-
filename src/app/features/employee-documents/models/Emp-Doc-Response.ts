export interface EmployeeDocumentResponse {
  id: number;
  documentType: string;
  fileName: string;
  file: string;
  uploadedAt: string;
  expiryDate: string;
  employeeName: string;
}

export interface UploadDocRequest {
  employeeId: number;
  documentType: string;
  file: File;
  expiryDate: string;
}

export interface EditDocRequest {
  id: number;
  documentType: string;
  file: File | null;
  expiryDate: string;
}