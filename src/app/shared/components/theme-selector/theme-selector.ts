import { Component, inject } from '@angular/core';


import { TitleCasePipe } from '@angular/common';
import { MaterialModule } from '../../ui/material-modules';
import { ThemeManagerService } from '../../../core/services/theme-manager';

@Component({
  selector: 'app-theme-selector',
  imports: [MaterialModule, TitleCasePipe],
  templateUrl: './theme-selector.html',
  styleUrl: './theme-selector.scss'
})
export class ThemeSelectorComponent {
  protected themeService = inject(ThemeManagerService);

}
