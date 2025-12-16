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
  form = new FormGroup({
    name: new FormControl('')
  });

  constructor(
    private dialogRef: MatDialogRef<ColumnModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  createColumn() {
    const name = this.form.value.name?.trim() ?? '';
    if (!name) return alert('Column name is required');

    this.dialogRef.close(name);
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
