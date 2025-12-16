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
})
export class LeadModalComponent {
  @Output() created = new EventEmitter<void>();

  form = new FormGroup({
    title: new FormControl(''),
    customer: new FormControl(''),
    description: new FormControl('')
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
      description: this.form.value.description ?? ''
    };

    this.leadsService.create(payload).subscribe(() => {
      this.created.emit();
      this.dialogRef.close(true);
    });
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
