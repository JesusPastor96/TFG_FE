import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MaterialModule } from '../../ui/material-modules';
import { DynamicTableAction, DynamicTableColumn } from '../../../interfaces/dynamic-table';

@Component({
  selector: 'app-dynamic-table',
  imports: [CommonModule, MaterialModule],
  templateUrl: './dynamic-table.html',
  styleUrl: './dynamic-table.scss',
})
export class DynamicTableComponent<T = unknown> {
  @Input() data: T[] = [];
  @Input() columns: DynamicTableColumn<T>[] = [];
  @Input() actions: DynamicTableAction<T>[] = [];
  @Input() emptyMessage = 'No hay datos disponibles';
  @Input() rowClickable = false;

  @Output() actionClick = new EventEmitter<{ action: string; row: T }>();
  @Output() rowClick = new EventEmitter<T>();

  get displayedColumns(): string[] {
    const baseColumns = this.columns.map((column) => column.key);
    return this.actions.length > 0 ? [...baseColumns, 'actions'] : baseColumns;
  }

  getCellValue(
    row: T,
    column: DynamicTableColumn<T>,
  ): string | number | null | undefined {
    if (column.valueFn) {
      return column.valueFn(row);
    }

    return (row as Record<string, unknown>)[column.key] as
      | string
      | number
      | null
      | undefined;
  }

  getCellClass(row: T, column: DynamicTableColumn<T>): string {
    return column.cellClassFn ? column.cellClassFn(row) : '';
  }

  getBadgeClass(row: T, column: DynamicTableColumn<T>): string {
  return column.badgeClassFn ? column.badgeClassFn(row) : '';
}

  isActionVisible(action: DynamicTableAction<T>, row: T): boolean {
    return action.showFn ? action.showFn(row) : true;
  }

  isActionDisabled(action: DynamicTableAction<T>, row: T): boolean {
    return action.disabledFn ? action.disabledFn(row) : false;
  }

  onActionSelected(actionId: string, row: T, event: Event): void {
    event.stopPropagation();
    this.actionClick.emit({ action: actionId, row });
  }

  onRowSelected(row: T): void {
    if (!this.rowClickable) return;
    this.rowClick.emit(row);
  }
}