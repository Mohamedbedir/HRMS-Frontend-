export interface DepartmentCreateRequest {
  name: string;
  description: string;
  isActive: boolean;
}

export interface DepartmentUpdateRequest extends DepartmentCreateRequest {
  id: number;
}