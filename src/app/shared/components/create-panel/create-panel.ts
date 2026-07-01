import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MaterialModule } from '../../ui/material-modules';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-panel',
  imports: [MaterialModule, CommonModule],
  standalone:true,
  templateUrl: './create-panel.html',
  styleUrl: './create-panel.scss',
})
export class CreatePanelComponent {

  @Input() title : string = "";
  @Input() expanded : boolean = false;

  @Output() expandedChange = new EventEmitter<boolean>();


  onExpandedChange(value:boolean){
    this.expandedChange.emit(value)
  }


}
