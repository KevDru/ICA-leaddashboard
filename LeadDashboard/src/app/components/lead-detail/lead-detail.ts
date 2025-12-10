import { Component, OnInit, signal, inject, Optional, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
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

  // Inject services
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private leadsService = inject(LeadsService);
  private historyService = inject(HistoryService);

  // Inject only when opened as a modal
  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public dialogData: any,
    @Optional() private dialogRef: MatDialogRef<LeadDetailComponent>
  ) {}

  ngOnInit(): void {
    // Prefer modal ID, fallback to route param
    const id =
      this.dialogData?.id ??
      Number(this.route.snapshot.paramMap.get('id'));

    if (id) this.loadLead(id);
  }

  loadLead(id: number) {
    this.leadsService.getById(id).subscribe((l: Lead) => {
      this.lead.set(l);
      this.form = new FormGroup({
        title: new FormControl(l.title),
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
    if (!this.lead()) return;

    this.leadsService.update(this.lead()!.id, this.form.value)
      .subscribe(() => {
        if (this.dialogRef) this.dialogRef.close(true);   // modal mode
      });
  }

  delete() {
    if (!this.lead() || !confirm('Delete this lead?')) return;

    this.leadsService.delete(this.lead()!.id).subscribe(() => {
      if (this.dialogRef) this.dialogRef.close(true);     // modal mode
      else this.router.navigate(['/']);                   // route fallback
    });
  }
}
