import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-drop-down-option',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="py-2 px-4 cursor-pointer hover:bg-gray-100"
      (click)="clickOption()"
    >
      <ng-content></ng-content>
    </div>
  `,
})
export class DropDownOptionComponent {
  @Input() value: any;
  @Output() selectValue = new EventEmitter<any>();
  clickOption() {
    this.selectValue.emit(this.value);
  }
}
