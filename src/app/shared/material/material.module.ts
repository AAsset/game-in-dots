import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';

const UI_COMPONENTS = [
  MatSelectModule,
  MatInputModule,
  MatButtonModule,
  MatFormFieldModule
];

@NgModule({
  declarations: [],
  imports: [ CommonModule, UI_COMPONENTS ],
  exports: [ UI_COMPONENTS ]
})
export class MaterialModule { }
