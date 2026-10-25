import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from '@relynn/ngx-toastr';
import { forkJoin } from 'rxjs';
import { CandidateResponse } from '../../../candidates/models/candidates-response';
import { CandidateService } from '../../../candidates/services/candidates.service';
import { JobPostingResponse } from '../../../job-postings/models/job-postings-response';
import { JobPostingService } from '../../../job-postings/services/jobposting.service';
import { ApplicationService } from '../../services/application.service';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-create-application-modal',
  styleUrl: './create-application-modal.css',
  templateUrl: './create-application-modal.html',
})
export class CreateApplicationModal implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly candidateService = inject(CandidateService);
  private readonly jobPostingService = inject(JobPostingService);
  private readonly applicationService = inject(ApplicationService);
  private readonly toastr = inject(ToastrService);

  @Output() applicationCreated = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  candidates: CandidateResponse[] = [];
  jobPostings: JobPostingResponse[] = [];
  isLoadingOptions = true;
  optionsError = false;
  isSubmitting = false;

  readonly form = this.fb.nonNullable.group({
    candidateId: [0, [Validators.required, Validators.min(1)]],
    jobPostingId: [0, [Validators.required, Validators.min(1)]],
    notes: ['', Validators.maxLength(2000)],
  });

  ngOnInit(): void {
    forkJoin({
      candidates: this.candidateService.getAllCandidates(),
      jobPostings: this.jobPostingService.getAllJobPostings(),
    }).subscribe({
      next: result => {
        this.isLoadingOptions = false;
        if (!result.candidates.succeeded || !Array.isArray(result.candidates.data) ||
            !result.jobPostings.succeeded || !Array.isArray(result.jobPostings.data)) {
          this.optionsError = true;
          this.toastr.error('Candidates and job postings could not be loaded.', 'Unable to create application');
          return;
        }
        this.candidates = result.candidates.data;
        this.jobPostings = result.jobPostings.data;
        if (!this.candidates.length || !this.jobPostings.length) {
          this.optionsError = true;
          this.toastr.error('Add a candidate and a job posting before creating an application.', 'Options unavailable');
        }
      },
      error: (error: unknown) => {
        console.error('Failed to load candidates and job postings for application creation.', error);
        this.isLoadingOptions = false;
        this.optionsError = true;
        this.toastr.error('Candidates and job postings could not be loaded. Please try again.', 'Unable to create application');
      },
    });
  }

  submit(): void {
    if (this.isSubmitting) {
      return;
    }
    if (this.form.invalid || this.optionsError) {
      this.form.markAllAsTouched();
      this.toastr.error('Select a candidate and a job posting before continuing.', 'Invalid application');
      return;
    }

    this.isSubmitting = true;
    this.applicationService.createApplication(this.form.getRawValue()).subscribe({
      next: response => {
        this.isSubmitting = false;
        if (!response.succeeded) {
          this.toastr.error(response.message || response.errors?.[0] || 'The application could not be created.', 'Creation failed');
          return;
        }
        this.toastr.success(response.message || 'Application created successfully.', 'Success');
        this.applicationCreated.emit();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Failed to create application.', error);
        this.isSubmitting = false;
        this.toastr.error(this.getErrorMessage(error), 'Creation failed');
      },
    });
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    const payload: unknown = error.error;
    if (typeof payload === 'object' && payload !== null) {
      const response = payload as { message?: unknown; errors?: unknown };
      if (typeof response.message === 'string' && response.message.trim()) {
        return response.message;
      }
      if (Array.isArray(response.errors) && typeof response.errors[0] === 'string') {
        return response.errors[0];
      }
    }
    return error.message || 'The application could not be created. Please try again.';
  }
}
