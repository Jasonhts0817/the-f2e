import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { ApiService } from 'src/app/core/service/api.service';

import { VoteYearEnum } from 'src/app/core/enums/vote-year.enum';
import { Elbase } from 'src/app/core/models/elbase.model';
import { Elcand } from 'src/app/core/models/elcand.model';
import { Elpaty } from 'src/app/core/models/elpaty.model';
import { Elprof } from 'src/app/core/models/elprof.model';
import { Elctks } from 'src/app/core/models/elctks.model';
import { forkJoin } from 'rxjs';
import { DisplayNamePipe } from 'src/app/core/pipes/display-name.pipe';
import { BarChartComponent } from 'src/app/shared/charts/bar-chart/bar-chart.component';
import { LineChartComponent } from 'src/app/shared/charts/line-chart/line-chart.component';
import { PieChartComponent } from 'src/app/shared/charts/pie-chart/pie-chart.component';
import { MapChartComponent } from 'src/app/shared/charts/map-chart/map-chart.component';

@Component({
  selector: 'app-sand-box',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DisplayNamePipe,
    BarChartComponent,
    LineChartComponent,
    PieChartComponent,
    MapChartComponent,
  ],
  templateUrl: './sand-box.component.html',
  styleUrls: ['./sand-box.component.scss'],
})
export class SandBoxComponent implements OnInit {
  VoteYearEnum = VoteYearEnum;
  currentVoteYear = VoteYearEnum._1996;

  elbases: Elbase[] = [];
  elcands: Elcand[] = [];
  elprofs: Elprof[] = [];
  elctkss: Elctks[] = [];
  elpatysObj: { [key: number]: string } = {};
  genderObject: { [key: number]: string } = { 1: '男', 2: '女' };

  displayElprofs: Elprof[] = [];
  displayElctkss: Elctks[] = [];

  regionFilterFormGroup!: FormGroup;
  provinceAndCountryCityOptions: Elbase[] = [];
  townshipDistrictOptions: Elbase[] = [];
  villageOptions: Elbase[] = [];

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.initFrom();
    this.getVoteYearData(this.currentVoteYear);
  }

  initFrom() {
    const f = this.fb.group<RegionFilterType>({
      provinceAnyCountyCity: undefined,
      townshipDistrict: undefined,
      village: undefined,
    });

    f.controls.provinceAnyCountyCity?.valueChanges.subscribe((elbase) => {
      if (!elbase) return;
      this.townshipDistrictOptions = this.getTownshipDistrictOptions(elbase);
    });
    f.controls.townshipDistrict?.valueChanges.subscribe((elbase) => {
      if (!elbase) return;
      this.villageOptions = this.getVillageOptions(elbase);
    });
    f.controls.village?.valueChanges.subscribe((elbase) => {});
    this.regionFilterFormGroup = f;
  }

  /** 取得投票年度資料 */
  getVoteYearData(voteYear: VoteYearEnum) {
    this.currentVoteYear = voteYear;
    this.apiService.getElbase(voteYear).subscribe((res) => {
      this.elbases = res;
      this.provinceAndCountryCityOptions =
        this.getProvinceAndCountryCityOptions(res);
    });

    forkJoin([
      this.apiService.getElpaty(voteYear),
      this.apiService.getElcand(voteYear),
    ]).subscribe(([elpatys, elcands]) => {
      this.elpatysObj = this.parseElpatyObj(elpatys);
      this.elcands = elcands;
    });

    this.apiService.getElprof(voteYear).subscribe((res) => {
      this.elprofs = res;
    });
    this.apiService.getElctks(voteYear).subscribe((res) => {
      this.elctkss = res;
    });
  }

  parseElpatyObj(elpatys: Elpaty[]): { [key: number]: string } {
    return elpatys.reduce(
      (patyObj, elpaty) => {
        patyObj[elpaty.politicalPartyCode] = elpaty.politicalPartyName;
        return patyObj;
      },
      {} as { [key: string]: string },
    );
  }

  /** 取得省市別選項 */
  getProvinceAndCountryCityOptions(elbases: Elbase[]): Elbase[] {
    return elbases.filter(
      (elbase) =>
        elbase.provinceCity !== '00' && // 排除全國
        elbase.electoralDistrict === '00' &&
        elbase.townshipDistrict === '000' &&
        elbase.village === '0000',
    );
  }

  /** 取得鄉鎮市區選項 */
  getTownshipDistrictOptions({ provinceCity, countyCity }: Elbase): Elbase[] {
    return this.elbases.filter(
      (elbase) =>
        elbase.townshipDistrict !== '000' && // 排除當前縣市
        elbase.provinceCity === provinceCity &&
        elbase.countyCity === countyCity &&
        elbase.village === '0000',
    );
  }

  /** 取得村里別選項 */
  getVillageOptions({
    provinceCity,
    countyCity,
    townshipDistrict,
  }: Elbase): Elbase[] {
    return this.elbases.filter(
      (elbase) =>
        elbase.provinceCity === provinceCity &&
        elbase.countyCity === countyCity &&
        elbase.townshipDistrict === townshipDistrict,
    );
  }
}

type RegionFilterType = {
  provinceAnyCountyCity?: Elbase;
  townshipDistrict?: Elbase;
  village?: Elbase;
};
