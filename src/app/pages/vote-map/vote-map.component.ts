import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BarChartComponent } from 'src/app/shared/charts/bar-chart/bar-chart.component';
import { LineChartComponent } from 'src/app/shared/charts/line-chart/line-chart.component';
import { VoteMapService } from './vote-map.service';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/core/service/api.service';
import { VoteYearEnum } from 'src/app/core/enums/vote-year.enum';

@Component({
  selector: 'app-vote-map',
  standalone: true,
  imports: [CommonModule, BarChartComponent, LineChartComponent],
  templateUrl: './vote-map.component.html',
})
export class VoteMapComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private voteMapService: VoteMapService,
    private apiService: ApiService,
  ) {}

  ngOnInit(): void {
    const { year, provinceAnyCountyCity, townshipDistrict, village } =
      this.route.snapshot.queryParams;
    const req = {
      year: year ?? VoteYearEnum._1996,
      provinceAnyCountyCity: provinceAnyCountyCity ?? 'all',
      townshipDistrict: townshipDistrict ?? 'all',
      village: village ?? 'all',
    };
    this.voteMapService.searchForm?.patchValue(req);
  }
}
