export interface JobPostingResponse {
  id: number;
  title: string;
  description: string;
  minSalary: number;
  maxSalary: number;
  status: 'Draft' | 'Published' | 'OnHold' | 'Closed' | 'Filled' | 'Canceled';
  postedAt: string;
  closingDate: string;
  departmentName: string;
  positionName: string;
  departmentId?: number;
  positionId?: number;
}

export interface JobPostingRequest {
  title: string;
  description: string;
  minSalary: number;
  maxSalary: number;
  closingDate: string;
  departmentId: number;
  positionId: number;
}

export interface EditJobPostingRequest extends JobPostingRequest{
  id: number;
}
