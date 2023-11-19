import { CommonModule } from '@angular/common';
import {
  AfterContentInit,
  Component,
  ContentChildren,
  QueryList,
  TemplateRef,
  ViewChild,
  forwardRef,
} from '@angular/core';
import { DropDownOptionComponent } from './drop-down-option.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-drop-down',
  standalone: true,
  imports: [CommonModule, OverlayModule],
  template: `
    <button
      (click)="_isOpen = !_isOpen"
      type="button"
      cdkOverlayOrigin
      #trigger="cdkOverlayOrigin"
      class="inline-flex justify-between items-center w-fill"
    >
      <span class="max-w-full text-ellipsis">{{
        value ? value : '請選擇'
      }}</span>
      <img class="p-2" src="assets/icons/expand_more.svg" alt="展開" />
    </button>
    <ng-template
      cdkConnectedOverlay
      cdkConnectedOverlayHasBackdrop
      (backdropClick)="close()"
      cdkConnectedOverlayBackdropClass="drop-down-backdrop"
      [cdkConnectedOverlayOrigin]="trigger"
      [cdkConnectedOverlayOpen]="_isOpen"
    >
      <div
        class="bg-white py-2 rounded-lg border-inline min-w-[280px] border-[1px]"
      >
        <ng-content></ng-content>
      </div>
    </ng-template>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropDownComponent),
      multi: true,
    },
  ],
})
export class DropDownComponent
  implements AfterContentInit, ControlValueAccessor
{
  @ContentChildren(DropDownOptionComponent)
  options!: QueryList<DropDownOptionComponent>;
  _isOpen = false;
  value: any;
  onChange = (value: any) => {};
  onTouched = (value: any) => {};
  disabled: boolean = false;

  constructor() {}

  ngAfterContentInit(): void {
    this.options.map((option) =>
      option.selectValue.subscribe((value) => {
        this.onChange(value);
        this.writeValue(value);
        this.close();
      }),
    );
  }

  close() {
    this._isOpen = false;
  }

  writeValue(obj: any): void {
    this.value = obj;
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: (value: any) => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
