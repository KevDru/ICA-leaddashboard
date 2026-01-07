import { Component, OnInit, signal, inject, Optional, Inject } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LeadsService } from '../../services/leads.services';
import { HistoryService } from '../../services/history.services';
import { AttachmentService } from '../../services/attachments.service';
import { NotesService } from '../../services/notes.service';
import { Lead } from '../../models/lead';
import { LeadHistory } from '../../models/history';
import { Attachment } from '../../models/attachment';
import { Note } from '../../models/note';
import { AppData } from '../../../app-data';

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
  attachments = signal<Attachment[]>([]);
  notes = signal<Note[]>([]);
  form!: FormGroup;
  noteForm = new FormGroup({
    content: new FormControl('', [Validators.required, Validators.minLength(1)])
  });
  uploadError = signal<string | null>(null);
  editingNoteId = signal<number | null>(null);
  notesExpanded = signal(false);
  attachmentsExpanded = signal(false);
  historyExpanded = signal(false);

  private leadsService = inject(LeadsService);
  private historyService = inject(HistoryService);
  private attachmentService = inject(AttachmentService);
  private notesService = inject(NotesService);
  private appData = inject(AppData);

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public dialogData: any,
    @Optional() private dialogRef: MatDialogRef<LeadDetailComponent>
  ) {}

  ngOnInit(): void {
    const id = this.dialogData?.id;
    if (id) this.loadLead(id);
  }

  toggleNotes() {
    this.notesExpanded.set(!this.notesExpanded());
  }

  toggleAttachments() {
    this.attachmentsExpanded.set(!this.attachmentsExpanded());
  }

  toggleHistory() {
    this.historyExpanded.set(!this.historyExpanded());
  }

  loadLead(id: number) {
    this.leadsService.getById(id).subscribe((l: Lead) => {
      this.lead.set(l);
      this.form = new FormGroup({
        title: new FormControl(l.title, [Validators.required, Validators.minLength(1)]),
        customer: new FormControl(l.customer),
        description: new FormControl(l.description),
        created_at: new FormControl(this.toDateTimeLocal(l.created_at))
      });
      this.loadHistory(id);
      this.loadAttachments(id);
      this.loadNotes(id);
    });
  }

  loadHistory(id: number) {
    this.historyService.get(id).subscribe(h => this.history.set(h));
  }

  loadAttachments(id: number) {
    this.attachmentService.getByLead(id).subscribe(a => this.attachments.set(a));
  }

  loadNotes(id: number) {
    this.notesService.getByLead(id).subscribe(n => this.notes.set(n));
  }

  addNote() {
    if (!this.lead() || !this.noteForm.valid) return;
    const content = this.noteForm.get('content')?.value || '';
    if (!content.trim()) return;
    
    this.notesService.create(this.lead()!.id, content).subscribe({
      next: (res) => {
        this.notes.set([res.note, ...this.notes()]);
        this.noteForm.reset();
      },
      error: (err) => alert(err?.error?.error ?? 'Failed to add note')
    });
  }

  deleteNote(id: number) {
    if (!confirm('Delete this note?')) return;
    this.notesService.delete(id).subscribe(() => {
      this.notes.set(this.notes().filter(n => n.id !== id));
    });
  }

  onFileSelected(event: any) {
    this.uploadError.set(null);
    const file: File = event.target.files[0];
    if (!file || !this.lead()) return;

    this.attachmentService.upload(this.lead()!.id, file).subscribe({
      next: (res) => {
        this.attachments.set([res.attachment, ...this.attachments()]);
        (event.target as HTMLInputElement).value = '';
      },
      error: (err) => this.uploadError.set(err?.error?.error ?? 'Upload failed')
    });
  }

  deleteAttachment(id: number) {
    if (!confirm('Delete this attachment?')) return;
    this.attachmentService.delete(id).subscribe(() => {
      this.attachments.set(this.attachments().filter(a => a.id !== id));
    });
  }

  downloadAttachment(attachment: Attachment) {
    // Serve from deployed uploads folder next to /api
    const base = this.appData.getBaseAPIURL().replace(/\/api$/, '');
    const url = `${base}/uploads/${attachment.file_path}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = attachment.file_name;
    link.click();
  }

  save() {
    if (!this.lead() || !this.form.valid) {
      alert('Title is required');
      return;
    }

    const payload = {
      ...this.form.value,
      created_at: this.toSqlDateTime(this.form.value.created_at as string | null)
    };

    this.leadsService.update(this.lead()!.id, payload)
      .subscribe({
        next: () => {
          if (this.dialogRef) this.dialogRef.close(true);
        },
        error: (err) => {
          alert(err.error?.error || 'Failed to save lead');
        }
      });
  }

  delete() {
    if (!this.lead() || !confirm('Delete this lead?')) return;

    this.leadsService.delete(this.lead()!.id).subscribe(() => {
      if (this.dialogRef) this.dialogRef.close(true);
    });
  }

  private toDateTimeLocal(value?: string | null): string | null {
    if (!value) return null;
    // Expecting value like "YYYY-MM-DD HH:mm:ss"; convert to datetime-local format
    return value.replace(' ', 'T').slice(0, 16);
  }

  private toSqlDateTime(value: string | null): string | undefined {
    if (!value) return undefined;
    return `${value.replace('T', ' ')}:00`;
  }
}

