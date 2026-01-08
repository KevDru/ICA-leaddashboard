import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-column-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './column-modal.html',
  styleUrls: ['./column-modal.scss']
})
export class ColumnModalComponent {
  isEdit = false;
  form: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<ColumnModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEdit = data?.isEdit || false;
    const column = data?.column;
    
    this.form = new FormGroup({
      name: new FormControl(column?.name || ''),
      color: new FormControl(column?.color || '#d1d5db')
    });
  }

  createColumn() {
    const name = this.form.value.name?.trim() ?? '';
    if (!name) return alert('Column name is required');

    const color = this.form.value.color || '#d1d5db';

    this.dialogRef.close({ name, color });
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
