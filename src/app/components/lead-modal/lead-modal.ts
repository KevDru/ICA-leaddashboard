import { Component, Inject, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LeadsService } from '../../services/leads.services';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-lead-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './lead-modal.html',
  styleUrls: ['./lead-modal.scss']
})
export class LeadModalComponent {
  @Output() created = new EventEmitter<void>();

  form = new FormGroup({
    title: new FormControl(''),
    customer: new FormControl(''),
    description: new FormControl(''),
    created_at: new FormControl(this.defaultCreatedAt())
  });

  columnId: number;

  constructor(
    private leadsService: LeadsService,
    private dialogRef: MatDialogRef<LeadModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.columnId = data?.columnId;
  }

  createLead() {
    const title = this.form.value.title?.trim() ?? '';
    if (!title) return alert('Title is required');
    if (!this.columnId) return alert('Column ID missing');

    const payload = {
      column_id: this.columnId,
      title,
      customer: this.form.value.customer ?? '',
      description: this.form.value.description ?? '',
      created_at: this.toSqlDateTime(this.form.value.created_at)
    };

    this.leadsService.create(payload).subscribe(() => {
      this.created.emit();           // notify parent to refresh
      this.dialogRef.close(true);    // close modal
    });
  }

  cancel() {
    this.dialogRef.close(false);
  }

  private defaultCreatedAt(): string {
    // Match datetime-local input format (YYYY-MM-DDTHH:mm)
    return new Date().toISOString().slice(0, 16);
  }

  private toSqlDateTime(value: unknown): string | undefined {
    if (!value || typeof value !== 'string') return undefined;
    // Convert from datetime-local (YYYY-MM-DDTHH:mm) to SQL friendly (YYYY-MM-DD HH:mm:00)
    const datePart = value.replace('T', ' ');
    return `${datePart}:00`;
  }
}
