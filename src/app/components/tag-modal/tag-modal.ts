import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-tag-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tag-modal.html',
  styleUrls: ['./tag-modal.scss']
})
export class TagModalComponent {
  form: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<TagModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(1)]),
      color: new FormControl('#d1d5db', [Validators.required])
    });
  }

  createTag() {
    if (!this.form.valid) return;

    const name = this.form.value.name?.trim() ?? '';
    const color = this.form.value.color || '#d1d5db';

    this.dialogRef.close({ name, color });
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
