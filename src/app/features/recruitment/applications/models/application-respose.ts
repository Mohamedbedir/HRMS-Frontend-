export interface ApplicationResponse {
  id: number;
  appliedAt: string;
  status: 'Applied' | 'Screening' | 'Interview' | 'Accepted' | 'Rejected' | 'Withdrawn' | string;
  notes: string;
  candidateId: number;
  candidateName: string;
  jobPostingId: number;
  jobPostTitle: string;
}

export interface ApplicationRequest {
  notes: string;
  candidateId: number;
  jobPostingId: number;
}

export interface EditApplicationRequest {
  id: number;
  notes: string;
}
