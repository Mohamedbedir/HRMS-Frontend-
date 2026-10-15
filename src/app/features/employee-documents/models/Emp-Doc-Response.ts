export interface EmployeeDocumentResponse {
  id: number;
  documentType: string;
  fileName: string;
  file: string;
  uploadedAt: string;
  expiryDate: string;
  employeeName: string;
}
