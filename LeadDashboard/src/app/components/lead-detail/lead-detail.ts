import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LeadsService } from '../../services/leads.services';
import { HistoryService } from '../../services/history.services';
import { Lead } from '../../models/lead';
import { LeadHistory } from '../../models/history';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';

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

  constructor(
    private route: ActivatedRoute,
    private leadsService: LeadsService,
    private historyService: HistoryService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadLead(id);
  }

  loadLead(id: number) {
    this.leadsService.getById(id).subscribe((l: Lead) => {
      if (l) this.lead.set(l);
      this.form = new FormGroup({
        title: new FormControl(l?.title),
        customer: new FormControl(l?.customer),
        description: new FormControl(l?.description)
      });
      this.loadHistory(id);
    });
  }

  loadHistory(id: number) {
    this.historyService.get(id).subscribe((h: LeadHistory[]) => this.history.set(h));
  }

  save() {
    if (!this.lead()) return;
    this.leadsService.update(this.lead()!.id, this.form.value).subscribe(() => this.loadHistory(this.lead()!.id));
  }
}
