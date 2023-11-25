import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropDownComponent } from 'src/app/shared/drop-down/drop-down.component';
import { DropDownOptionComponent } from 'src/app/shared/drop-down/drop-down-option.component';
import { ReactiveFormsModule } from '@angular/forms';
import { VoteMapService } from 'src/app/pages/vote-map/vote-map.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DropDownComponent,
    DropDownOptionComponent,
    RouterModule,
  ],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {
  constructor(public voteMapService: VoteMapService) {}
  ngOnInit(): void {}
}
