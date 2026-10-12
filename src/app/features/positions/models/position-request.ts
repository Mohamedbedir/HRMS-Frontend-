export interface PositionCreateRequest {
  title: string;
  description: string;
  isActive: boolean;
  minSalary: number;
  maxSalary: number;
}

export interface PositionUpdateRequest extends PositionCreateRequest {
  id: number;
}
