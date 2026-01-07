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
    name: new FormControl(''),
    color: new FormControl('#ffffff')
  });

  constructor(
    private dialogRef: MatDialogRef<ColumnModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  // If `data` was provided (editing), populate the form with existing values
  ngOnInit() {
    if (this.data) {
      if (this.data.name) this.form.controls['name'].setValue(this.data.name);
      if (this.data.color) this.form.controls['color'].setValue(this.data.color);
    }
  }

  createColumn() {
    const name = this.form.value.name?.trim() ?? '';
    const color = this.form.value.color || '';
    if (!name) return alert('Column name is required');

    // return an object so caller can persist both name and color
    this.dialogRef.close({ name, color });
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
