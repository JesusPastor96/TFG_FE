import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MaterialModule } from '../../ui/material-modules';

@Component({
  selector: 'app-detail-view',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './detail-view.component.html',
  styleUrl: './detail-view.component.scss',
})
export class DetailViewComponent {
  data = input<unknown | null>(null);

  close = output<void>();
}
