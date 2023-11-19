import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropDownComponent } from 'src/app/shared/drop-down/drop-down.component';
import { DropDownOptionComponent } from 'src/app/shared/drop-down/drop-down-option.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [DropDownComponent, DropDownOptionComponent],
  templateUrl: './header.component.html',
})
export class HeaderComponent {}
