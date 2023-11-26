import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DbService } from 'src/app/core/service/db.service';
import { VoteYearEnum } from 'src/app/core/enums/vote-year.enum';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing-page.component.html',
})
export class LandingPageComponent {
  constructor(private db: DbService) {
    this.db.elbase.where({ year: VoteYearEnum._2020 }).toArray().then();
  }
}
