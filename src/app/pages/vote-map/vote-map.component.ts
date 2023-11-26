import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  BehaviorSubject,
  Subject,
  combineLatest,
  interval,
  map,
  takeUntil,
} from 'rxjs';

import { VoteMapService } from './vote-map.service';
import { VoteYearEnum } from 'src/app/core/enums/vote-year.enum';
import { FooterComponent } from 'src/app/layout/footer/footer.component';
import { BarChartComponent } from 'src/app/shared/charts/bar-chart.component';
import { LineChartComponent } from 'src/app/shared/charts/line-chart.component';
import { StackChartComponent } from 'src/app/shared/charts/stack-chart.component';
import { DonutChartComponent } from 'src/app/shared/charts/donut-chart.component';
import { MapChartComponent } from 'src/app/shared/charts/map-chart.component';
import { DbService } from 'src/app/core/service/db.service';

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
  isLoaded = false;
  progress = new BehaviorSubject<number>(0);
  intervalTime: number = 2000;
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

  mapChartCountryData = this.voteMapService.countryVoteInfoVM.pipe(
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

  mapChartAreaData = this.voteMapService.areaVoteInfoVM.pipe(
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

  breadCrumb: string[] = [];

  title = '';

  get isProvinceAnyCountyCity() {
    return this.breadCrumb.length === 1;
  }
  get isTownshipDistrict() {
    return this.breadCrumb.length === 2;
  }
  get isVillage() {
    return this.breadCrumb.length === 3;
  }

  constructor(
    private route: ActivatedRoute,
    public voteMapService: VoteMapService,
    private db: DbService,
  ) {}

  ngOnInit(): void {
    const { year, provinceAnyCountyCity, townshipDistrict } =
      this.route.snapshot.queryParams;
    const req = {
      year: year ?? VoteYearEnum._2020,
      provinceAnyCountyCity: provinceAnyCountyCity,
      townshipDistrict: townshipDistrict,
    };
    this._registerSearchFormChange();
    this._registerLoadingProgress(year);
    this.voteMapService.searchForm?.patchValue(req);
  }

  changeCity(cityName: string) {
    let option = this.voteMapService.provinceAndCountryCityOptions.value.find(
      (country) => country.name == cityName,
    );
    option = option
      ? option
      : this.voteMapService.provinceAndCountryCityOptions.value[0];

    this.voteMapService.searchForm?.controls[
      'provinceAnyCountyCity'
    ].patchValue(option);
  }

  changeTown(townName: string) {
    let option = this.voteMapService.townshipDistrictOptions.value.find(
      (country) => country.name == townName,
    );
    option = option
      ? option
      : this.voteMapService.townshipDistrictOptions.value[0];

    this.voteMapService.searchForm?.controls['townshipDistrict'].patchValue(
      option,
    );
  }

  clickAreaInfo(areaName: string) {
    if (this.isProvinceAnyCountyCity) {
      this.changeCity(areaName);
    } else if (this.isTownshipDistrict) {
      this.changeTown(areaName);
    }
  }

  windowScrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private _registerSearchFormChange() {
    this.voteMapService.searchForm?.valueChanges.subscribe((search) => {
      const breadCrumb = ['全臺縣市總統得票'];

      const { provinceAnyCountyCity, townshipDistrict } = search;
      if (
        provinceAnyCountyCity &&
        (provinceAnyCountyCity.provinceCity !== '00' ||
          provinceAnyCountyCity.countyCity !== '000')
      ) {
        breadCrumb.push(provinceAnyCountyCity.name);
      }
      if (townshipDistrict && townshipDistrict?.countyCity !== '00') {
        breadCrumb.push(townshipDistrict?.name);
      }
      this.breadCrumb = breadCrumb;
      this.title = breadCrumb[breadCrumb.length - 1];
    });
  }

  private async _registerLoadingProgress(year: VoteYearEnum) {
    const elctk = await this.db.elctks.where({ year }).first();
    this.intervalTime = elctk ? 100 : 2000;
    const isLoadedQueue: string[] = [];
    const destry$ = new Subject();
    const pushToLoadedQueue = (dataName: string, res: any) => {
      if (res && res.length > 0 && !isLoadedQueue.includes(dataName)) {
      }
    };
    const queueInterval = interval(this.intervalTime);

    queueInterval.pipe(takeUntil(destry$)).subscribe(() => {
      if (this.progress.value > 100) {
        this.isLoaded = true;
        destry$.next(true);
        destry$.complete();
      }
      this.progress.next(this.progress.value + 12.5);
    });

    combineLatest([
      this.top3CandidateInfo.pipe(
        map((res) => pushToLoadedQueue('top3CandidateInfo', res)),
      ),
      this.stackChartData.pipe(
        map((res) => pushToLoadedQueue('stackChartData', res)),
      ),
      this.donutChartData.pipe(
        map((res) => pushToLoadedQueue('donutChartData', res)),
      ),
      this.mapChartCountryData.pipe(
        map((res) => pushToLoadedQueue('mapChartCountryData', res)),
      ),
      this.mapChartAreaData.pipe(
        map((res) => pushToLoadedQueue('mapChartAreaData', res)),
      ),
      this.areaVoteInfoVM.pipe(
        map((res) => pushToLoadedQueue('areaVoteInfoVM', res)),
      ),
      this.historyPartyVoteCount.pipe(
        map((res) => pushToLoadedQueue('historyPartyVoteCount', res)),
      ),
      this.historyPartyVotePercentage.pipe(
        map((res) => pushToLoadedQueue('historyPartyVotePercentage', res)),
      ),
    ])
      .pipe(takeUntil(destry$))
      .subscribe();
  }

  private _getPartyTheme(partyName: string) {
    return (
      this.themesConfig.find((theme) => theme.partyName === partyName) ??
      this.themesConfig[this.themesConfig.length - 1]
    );
  }
}
