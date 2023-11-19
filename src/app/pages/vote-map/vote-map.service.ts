import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { VoteYearEnum } from 'src/app/core/enums/vote-year.enum';
import { Elbase } from 'src/app/core/models/elbase.model';
import { Elcand } from 'src/app/core/models/elcand.model';
import { Elctks } from 'src/app/core/models/elctks.model';
import { Elpaty } from 'src/app/core/models/elpaty.model';
import { Elprof } from 'src/app/core/models/elprof.model';
import { ApiService } from 'src/app/core/service/api.service';

@Injectable({
  providedIn: 'root',
})
export class VoteMapService {
  searchForm?: FormGroup;

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
  provinceAndCountryCityOptions = new BehaviorSubject<Elbase[]>([]);
  townshipDistrictOptions = new BehaviorSubject<Elbase[]>([]);
  villageOptions = new BehaviorSubject<Elbase[]>([]);
  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
  ) {
    this.initFrom();
  }

  initFrom() {
    const f = this.fb.group<RegionFilterType>({
      year: undefined,
      provinceAnyCountyCity: undefined,
      townshipDistrict: undefined,
      village: undefined,
    });
    f.controls.year?.valueChanges.subscribe((year) => {
      if (!year) return;
      this.getVoteYearData(year);
    });

    f.controls.provinceAnyCountyCity?.valueChanges.subscribe((elbase) => {
      if (!elbase) return;
      f.controls.village?.patchValue(undefined);
      f.controls.townshipDistrict?.patchValue(undefined);
      this.townshipDistrictOptions.next(
        this.getTownshipDistrictOptions(elbase),
      );
    });
    f.controls.townshipDistrict?.valueChanges.subscribe((elbase) => {
      if (!elbase) return;
      f.controls.village?.patchValue(undefined);
      this.villageOptions.next(this.getVillageOptions(elbase));
    });
    this.searchForm = f;
  }

  /** 取得投票年度資料 */
  getVoteYearData(voteYear: VoteYearEnum) {
    this.currentVoteYear = voteYear;
    this.apiService.getElbase(voteYear).subscribe((res) => {
      this.elbases = res;
      this.provinceAndCountryCityOptions.next(
        this.getProvinceAndCountryCityOptions(res),
      );
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
      {} as { [key: number]: string },
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
        elbase.townshipDistrict === townshipDistrict &&
        elbase.village !== '0000', // 排除當前鄉鎮市區
    );
  }
}

export type RegionFilterType = {
  year?: VoteYearEnum;
  provinceAnyCountyCity?: Elbase;
  townshipDistrict?: Elbase;
  village?: Elbase;
};
