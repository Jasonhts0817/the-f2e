import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

import { VoteMapService } from './vote-map.service';
import { VoteYearEnum } from 'src/app/core/enums/vote-year.enum';
import { FooterComponent } from 'src/app/layout/footer/footer.component';
import { BarChartComponent } from 'src/app/shared/charts/bar-chart.component';
import { LineChartComponent } from 'src/app/shared/charts/line-chart.component';
import { StackChartComponent } from 'src/app/shared/charts/stack-chart.component';
import { DonutChartComponent } from 'src/app/shared/charts/donut-chart.component';
import { MapChartComponent } from 'src/app/shared/charts/map-chart.component';

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
      cands.map((cand, i) => {
        const theme = this._getPartyTheme(cand.politicalPartyName);

        return {
          ...cand,
          ...theme,
        };
      }),
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

  donutChartData = this.voteMapService.voteInfo.pipe(
    map((voteInfo) => [
      voteInfo?.voterTurnout as number,
      100 - (voteInfo?.voterTurnout as number),
    ]),
  );

  mapChartData = this.voteMapService.areaVoteInfoVM.pipe(
    map((infos) =>
      infos.map((info) => {
        const theme = this._getPartyTheme(info.electedPartyName);
        return {
          areaName: info.areaName,
          ...theme,
        };
      }),
    ),
  );

  areaVoteInfoVM = this.voteMapService.areaVoteInfoVM.pipe(
    map((infos) =>
      infos.map((info) => {
        const theme = this._getPartyTheme(info.electedPartyName);
        return {
          ...info,
          ...theme,
          partyVoteInfos: info.partyVoteInfos.map((party) => ({
            name: party.candName,
            value: party.votePercentage,
          })),
        };
      }),
    ),
  );

  historyPartyVoteCount = this.voteMapService.historyPartyInfos.pipe(
    map((infos) =>
      infos
        .filter((info) => info?.year)
        .map((info) => ({
          year: info?.year,
          name: info?.politicalPartyName,
          value: info?.voteCount,
        })),
    ),
  );

  historyPartyVotePercentage = this.voteMapService.historyPartyInfos.pipe(
    map((infos) =>
      infos
        .filter((info) => info?.year)
        .map((info) => ({
          year: info?.year,
          name: info?.politicalPartyName,
          percent: Math.round(info?.votePercentage),
          value: info?.voteCount,
        })),
    ),
  );

  themes = this.top3CandidateInfo.pipe(
    map((infos) => infos.map(({ hex }) => hex)),
  );

  themesConfig = [
    {
      partyName: '中國國民黨',
      img: 'assets/images/candidate-1.png',
      color: 'bg-role-1',
      hex: '#8082FF',
    },
    {
      partyName: '親民黨',
      img: 'assets/images/candidate-2.png',
      color: 'bg-role-2',
      hex: '#F4A76F',
    },
    {
      partyName: '民主進步黨',
      img: 'assets/images/candidate-3.png',
      color: 'bg-role-3',
      hex: '#57D2A9',
    },
    {
      partyName: '其他',
      img: 'assets/images/candidate-4.png',
      color: 'bg-role-other',
      hex: '#64748B',
    },
  ];

  constructor(
    private route: ActivatedRoute,
    public voteMapService: VoteMapService,
  ) {}

  ngOnInit(): void {
    const { year, provinceAnyCountyCity, townshipDistrict, village } =
      this.route.snapshot.queryParams;
    const req = {
      year: year ?? VoteYearEnum._2020,
      provinceAnyCountyCity: provinceAnyCountyCity,
      townshipDistrict: townshipDistrict,
      village: village,
    };
    this.voteMapService.searchForm?.patchValue(req);
  }

  private _getPartyTheme(partyName: string) {
    return (
      this.themesConfig.find((theme) => theme.partyName === partyName) ??
      this.themesConfig[this.themesConfig.length - 1]
    );
  }
}
