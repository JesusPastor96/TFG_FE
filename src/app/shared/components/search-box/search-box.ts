import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MaterialModule } from '../../ui/material-modules';
@Component({
  selector: 'app-search-box',
  imports: [MaterialModule],
  standalone:true,
  templateUrl: './search-box.html',
  styleUrl: './search-box.scss',
})
export class SearchBoxComponent {

  @Input() label = "";
  @Input() placeholder = "";

  @Output() valueChange = new EventEmitter<string>();

  onInput(value:string){
    const normalized = value.trim().toLocaleLowerCase();
    this.valueChange.emit(normalized);
  }

}
