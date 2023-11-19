import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-drop-down-option',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="cursor-pointer px-4 py-2 hover:bg-gray-100"
      (click)="clickOption()"
    >
      <ng-content></ng-content>
    </div>
  `,
})
export class DropDownOptionComponent {
  @Input() value: any;
  @Output() selectValue = new EventEmitter<any>();
  constructor(public ref: ElementRef<HTMLElement>) {}
  clickOption() {
    this.selectValue.emit(this.value);
  }
}
