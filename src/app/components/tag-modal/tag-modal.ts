import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Tag } from '../../models/tag';

@Component({
  selector: 'app-tag-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tag-modal.html',
  styleUrls: ['./tag-modal.scss']
})
export class TagModalComponent {
  isEdit = false;
  form: FormGroup;
  existingTags: Tag[] = [];
  duplicateNameError = false;
  duplicateColorError = false;

  constructor(
    private dialogRef: MatDialogRef<TagModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEdit = data?.isEdit || false;
    this.existingTags = data?.existingTags || [];
    const tag = data?.tag;
    
    this.form = new FormGroup({
      name: new FormControl(tag?.name || '', [Validators.required, Validators.minLength(1)]),
      color: new FormControl(tag?.color || '#6366f1')
    });
  }

  createTag() {
    if (!this.form.valid) return;

    const name = this.form.value.name?.trim() ?? '';
    if (!name) return alert('Tag name is required');

    const color = this.form.value.color || '#6366f1';

    // Validate no duplicate name
    const nameTaken = this.existingTags.some(t => 
      t.name.toLowerCase() === name.toLowerCase() && t.id !== (this.data?.tag?.id)
    );
    if (nameTaken) {
      this.duplicateNameError = true;
      return;
    }

    // Validate no duplicate color
    const colorTaken = this.existingTags.some(t => 
      t.color === color && t.id !== (this.data?.tag?.id)
    );
    if (colorTaken) {
      this.duplicateColorError = true;
      return;
    }

    this.dialogRef.close({ name, color });
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
