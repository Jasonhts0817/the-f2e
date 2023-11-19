import { CommonModule } from '@angular/common';
import {
  AfterContentInit,
  Component,
  ContentChildren,
  ElementRef,
  HostListener,
  QueryList,
  forwardRef,
} from '@angular/core';
import { DropDownOptionComponent } from './drop-down-option.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-drop-down',
  standalone: true,
  imports: [CommonModule, OverlayModule],
  styles: [':host{ display: inline-block}'],
  template: `
    <button
      (click)="_isOpen = !_isOpen"
      type="button"
      cdkOverlayOrigin
      #trigger="cdkOverlayOrigin"
      class="inline-flex w-full items-center justify-between whitespace-nowrap"
    >
      <span class="max-w-full text-ellipsis">{{
        label ? label : '請選擇'
      }}</span>
      <img class="p-2" src="assets/icons/expand_more.svg" alt="展開" />
    </button>
    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOffsetY]="15"
      [cdkConnectedOverlayOffsetX]="-16"
      [cdkConnectedOverlayOrigin]="trigger"
      [cdkConnectedOverlayOpen]="_isOpen"
    >
      <div
        class="min-w-[185px] rounded-lg border-[1px] border-line bg-white py-2"
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

  public get label(): string {
    return (
      this.options.find((option) => option.value === this.value)?.ref
        .nativeElement.textContent ?? ''
    );
  }

  constructor(private ref: ElementRef<HTMLElement>) {}

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
  @HostListener('document:click', ['$event'])
  click(event: Event) {
    if (!this.ref.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }
}
