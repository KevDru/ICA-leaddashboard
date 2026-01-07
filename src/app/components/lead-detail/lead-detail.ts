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

  private readonly leadsService = inject(LeadsService);
  private readonly historyService = inject(HistoryService);
  private readonly attachmentService = inject(AttachmentService);
  private readonly notesService = inject(NotesService);
  private readonly appData = inject(AppData);

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public dialogData: { id?: number } | null,
    @Optional() private dialogRef: MatDialogRef<LeadDetailComponent> | null
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
        contact_name: new FormControl((l as any).contact_name ?? ''),
        contact_email: new FormControl((l as any).contact_email ?? '', [Validators.email]),
        contact_phone: new FormControl((l as any).contact_phone ?? ''),
        description: new FormControl(l.description),
        created_at: new FormControl(this.toDateTimeLocal(l.created_at))
      });
      this.loadHistory(id);
      this.loadAttachments(id);
      this.loadNotes(id);
    });
  }

  /**
   * Add a small optimistic history entry and then refresh from server.
   * Keeps the duplicate logic from addNote/onFileSelected in one place.
   */
  private addOptimisticHistory(action: string, userName: string | null) {
    if (!this.lead()) return;
    const fakeHistory: any = {
      id: null,
      lead_id: this.lead()!.id,
      action,
      user_name: userName ?? null,
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
    this.history.set([fakeHistory, ...this.history()]);
    this.historyExpanded.set(true);
    this.loadHistory(this.lead()!.id);
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
        // Optimistic history + refresh (moved to helper)
        this.addOptimisticHistory(`Notitie toegevoegd:note_id=${res.note.id}`, res.note.author_name ?? null);
      },
      error: (err) => this.showError(err, 'Failed to add note')
    });
  }

  onNoteTextareaKeydown(event: KeyboardEvent) {
    const target = event.target as HTMLTextAreaElement | null;
    if (!target) return;
    // Plain Enter -> insert newline at cursor position (prevent any accidental submit)
    if (event.key === 'Enter') {
      event.preventDefault();
      const ctrl = this.noteForm.get('content');
      const value = ctrl?.value ?? '';
      const start = target.selectionStart ?? value.length;
      const end = target.selectionEnd ?? value.length;
      const newValue = value.slice(0, start) + '\n' + value.slice(end);
      ctrl?.setValue(newValue);
      // move caret after inserted newline
      setTimeout(() => {
        try { target.selectionStart = target.selectionEnd = start + 1; } catch (e) {}
      }, 0);
    }
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
        // Optimistic history + refresh (moved to helper)
        this.addOptimisticHistory(`Bijlage toegevoegd:attachment_id=${res.attachment.id}`, res.attachment.uploader_name ?? null);
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
            this.showError(err, 'Failed to save lead');
        }
      });
  }

    private showError(err: any, fallback?: string) {
      const msg = err?.error?.error ?? fallback ?? 'An error occurred';
      // Keep the simple UX the original code had but centralize logging
      alert(msg);
      console.error(err);
    }

  onHistoryClick(h: any) {
    // Try to detect note or attachment references in the action text
    const action = (h.action || '').toString();

    const noteMatch = action.match(/note_id[=:](\d+)/i);
    if (noteMatch) {
      const noteId = Number(noteMatch[1]);
      this.notesExpanded.set(true);
      // ensure notes are loaded
      if (!this.notes().length && this.lead()) this.loadNotes(this.lead()!.id);
      // wait a tick for DOM to render
      setTimeout(() => {
        const el = document.getElementById('note-' + noteId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('highlight');
          setTimeout(() => el.classList.remove('highlight'), 2200);
        }
      }, 200);
      return;
    }

    const attMatch = action.match(/attachment_id[=:](\d+)/i);
    if (attMatch) {
      const attId = Number(attMatch[1]);
      this.attachmentsExpanded.set(true);
      if (!this.attachments().length && this.lead()) this.loadAttachments(this.lead()!.id);
      setTimeout(() => {
        const el = document.querySelector(`[data-attachment-id="${attId}"]`);
        if (el && typeof (el as HTMLElement).scrollIntoView === 'function') {
          (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('highlight');
          setTimeout(() => el.classList.remove('highlight'), 2200);
        }
      }, 200);
      return;
    }

    // Fallback: do nothing
  }

  /**
   * Return true when the history action references a note or attachment so
   * the template can render a hover/click affordance.
   */
  isHistoryClickable(h: any): boolean {
    const action = (h?.action || '').toString();
    const noteMatch = /note_id[=:](\d+)/i.test(action);
    const attMatch = /attachment_id[=:](\d+)/i.test(action);
    return Boolean(noteMatch || attMatch);
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

