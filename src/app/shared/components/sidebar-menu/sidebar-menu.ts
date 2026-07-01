import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';

import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../ui/material-modules';

@Component({
  selector: 'app-sidebar-menu',
  imports: [MaterialModule, CommonModule, RouterModule],
  templateUrl: './sidebar-menu.html',
  styleUrl: './sidebar-menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideBarMenuComponent {
  @Input() isMobile = false;
  @Output() itemClicked = new EventEmitter<void>();

  handleItemClick() {
    if (this.isMobile) {
      this.itemClicked.emit();
    }
  }

  @Input() userRole: string | null = null;
  @Input() pendingAdmissions: number = 0;
}
