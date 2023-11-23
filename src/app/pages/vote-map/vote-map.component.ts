import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BarChartComponent } from 'src/app/shared/charts/bar-chart/bar-chart.component';
import { LineChartComponent } from 'src/app/shared/charts/line-chart/line-chart.component';
import { VoteMapService } from './vote-map.service';
import { ActivatedRoute } from '@angular/router';
import { VoteYearEnum } from 'src/app/core/enums/vote-year.enum';
import { StackChartComponent } from 'src/app/shared/charts/stack-chart/stack-chart.component';
import { DonutChartComponent } from 'src/app/shared/charts/donut-chart/donut-chart.component';
import { map } from 'rxjs';
import { MapChartComponent } from 'src/app/shared/charts/map-chart/map-chart.component';
import { FooterComponent } from 'src/app/layout/footer/footer.component';

@Component({
  selector: 'app-vote-map',
  standalone: true,
  imports: [
    CommonModule,
    BarChartComponent,
    LineChartComponent,
    StackChartComponent,
    DonutChartComponent,
    MapChartComponent,
    FooterComponent,
  ],
  templateUrl: './vote-map.component.html',
})
export class VoteMapComponent implements OnInit {
  top3CandidateInfo = this.voteMapService.top3CandidateInfo.pipe(
    map((cands) =>
      cands.map((cand, i) => ({
        ...cand,
        ...this.themes[i],
      })),
    ),
  );

  stackChartData = this.voteMapService.top3CandidateInfo.pipe(
    map((cands) =>
      cands.map(({ votePercentage, name }) => ({
        name: name,
        value: votePercentage,
      })),
    ),
  );

  donutChartData = this.voteMapService.voteInfo.pipe<number[]>(
    map((voteInfo) => [
      voteInfo?.voterTurnout as number,
      100 - (voteInfo?.voterTurnout as number),
    ]),
  );

  areaVoteInfoVM = this.voteMapService.areaVoteInfoVM.pipe(
    map((infos) =>
      infos.map((info) => ({
        ...info,
        partyVoteInfos: info.partyVoteInfos.map((party) => ({
          name: party.candName,
          value: party.votePercentage,
        })),
      })),
    ),
  );

  themes = [
    { img: 'assets/images/candidate-1.png', color: 'bg-role-1' },
    { img: 'assets/images/candidate-2.png', color: 'bg-role-2' },
    { img: 'assets/images/candidate-3.png', color: 'bg-role-3' },
  ];

  constructor(
    private route: ActivatedRoute,
    public voteMapService: VoteMapService,
  ) {}

  ngOnInit(): void {
    const { year, provinceAnyCountyCity, townshipDistrict, village } =
      this.route.snapshot.queryParams;
    const req = {
      year: year ?? VoteYearEnum._1996,
      provinceAnyCountyCity: provinceAnyCountyCity,
      townshipDistrict: townshipDistrict,
      village: village,
    };
    this.voteMapService.searchForm?.patchValue(req);
  }
}
