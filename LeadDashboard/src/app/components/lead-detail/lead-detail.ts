import { Component, OnInit, signal, inject, Optional, Inject } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LeadsService } from '../../services/leads.services';
import { HistoryService } from '../../services/history.services';
import { Lead } from '../../models/lead';
import { LeadHistory } from '../../models/history';

@Component({
  selector: 'app-lead-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './lead-detail.html',
  styleUrls: ['./lead-detail.scss']
})
export class LeadDetailComponent implements OnInit {
  lead = signal<Lead | null>(null);
  history = signal<LeadHistory[]>([]);
  form!: FormGroup;

  private leadsService = inject(LeadsService);
  private historyService = inject(HistoryService);

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public dialogData: any,
    @Optional() private dialogRef: MatDialogRef<LeadDetailComponent>
  ) {}

  ngOnInit(): void {
    const id = this.dialogData?.id;
    if (id) this.loadLead(id);
  }

  loadLead(id: number) {
    this.leadsService.getById(id).subscribe((l: Lead) => {
      this.lead.set(l);
      this.form = new FormGroup({
        title: new FormControl(l.title, [Validators.required, Validators.minLength(1)]),
        customer: new FormControl(l.customer),
        description: new FormControl(l.description)
      });
      this.loadHistory(id);
    });
  }

  loadHistory(id: number) {
    this.historyService.get(id).subscribe(h => this.history.set(h));
  }

  save() {
    if (!this.lead() || !this.form.valid) {
      alert('Title is required');
      return;
    }

    this.leadsService.update(this.lead()!.id, this.form.value)
      .subscribe({
        next: () => {
          if (this.dialogRef) this.dialogRef.close(true); // notify parent
        },
        error: (err) => {
          alert(err.error?.error || 'Failed to save lead');
        }
      });
  }

  delete() {
    if (!this.lead() || !confirm('Delete this lead?')) return;

    this.leadsService.delete(this.lead()!.id).subscribe(() => {
      if (this.dialogRef) this.dialogRef.close(true); // notify parent
    });
  }
}
