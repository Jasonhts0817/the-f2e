import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from 'src/app/core/service/api.service';
import { VoteYearEnum } from 'src/app/core/enums/vote-year.enum';

@Component({
  selector: 'app-sand-box',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sand-box.component.html',
  styleUrls: ['./sand-box.component.scss'],
})
export class SandBoxComponent implements OnInit {
  VoteYearEnum = VoteYearEnum;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    // this.apiService.getElbase()
  }
}
