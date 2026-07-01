export interface DynamicTableColumn<T = unknown> {
  key: string;
  label: string;
  valueFn?: (row: T) => string | number | null | undefined;
  cellClassFn?: (row: T) => string;
  type?: 'text' | 'badge';
  badgeClassFn?: (row: T) => string;
}

export interface DynamicTableAction<T = unknown> {
  id: string;
  icon: string;
  tooltip?: string;
  showFn?: (row: T) => boolean;
  disabledFn?: (row: T) => boolean;
}