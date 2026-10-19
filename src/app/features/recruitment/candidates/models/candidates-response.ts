export interface CandidateResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cv: string;
  createdAt: string;
}

export interface CandidateRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cv: File;
}

export interface EditCandidateRequest {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cv: File | null;
}
