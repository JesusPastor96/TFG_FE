import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-floor-name-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Nueva Planta</h2>
    <mat-dialog-content>
      <p>Introduce el nombre para la nueva planta:</p>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Nombre de la planta</mat-label>
        <input matInput [(ngModel)]="floorName" placeholder="Ej: Planta 1, Terraza..." autoFocus>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="!floorName.trim()" (click)="onConfirm()">Crear</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; margin-top: 8px; }
  `]
})
export class FloorNameDialogComponent {
  private dialogRef = inject(MatDialogRef<FloorNameDialogComponent>);
  floorName: string = '';

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.floorName.trim()) {
      this.dialogRef.close(this.floorName.trim());
    }
  }
}
