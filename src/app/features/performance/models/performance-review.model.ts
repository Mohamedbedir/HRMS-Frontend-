export interface PerformanceReviewResponse {
  id: number;
  month: number;
  year: number;
  reviewDate: string;
  score: number;
  comments: string;
  createdAt: string;
  employeeId: number;
  employeeName: string;
  reviewerId: number;
  reviewerName: string;
}

export interface CreatePerformanceReviewRequest {
  employeeId: number;
  month: number;
  year: number;
  score: number;
  comments: string;
}
