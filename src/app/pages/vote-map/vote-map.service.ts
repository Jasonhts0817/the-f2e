import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { VoteYearEnum } from 'src/app/core/enums/vote-year.enum';
import { Elbase } from 'src/app/core/models/elbase.model';
import { Elcand } from 'src/app/core/models/elcand.model';
import { Elctks } from 'src/app/core/models/elctks.model';
import { Elpaty } from 'src/app/core/models/elpaty.model';
import { Elprof } from 'src/app/core/models/elprof.model';
import { ApiService } from 'src/app/core/service/api.service';
import {
  CandidateInfoVM,
  RegionFilterVM,
  VoteInfoVM,
} from './vote-map.view-model';
import { DbService } from 'src/app/core/service/db.service';

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
  elctks: Elctks[] = [];
  elpatysObj: { [key: number]: string } = {};
  genderObject: { [key: number]: string } = { 1: '男', 2: '女' };

  top3CandidateInfo = new BehaviorSubject<CandidateInfoVM[]>([]);
  voteInfo = new BehaviorSubject<VoteInfoVM | undefined>(undefined);
  displayElprofs = new BehaviorSubject<Elprof[]>([]);
  displayElctkses = new BehaviorSubject<Elctks[]>([]);

  regionFilterFormGroup!: FormGroup;
  provinceAndCountryCityOptions = new BehaviorSubject<Elbase[]>([]);
  townshipDistrictOptions = new BehaviorSubject<Elbase[]>([]);
  villageOptions = new BehaviorSubject<Elbase[]>([]);
  constructor(
    private db: DbService,
    private fb: FormBuilder,
  ) {
    this.initFrom();
  }

  initFrom() {
    const f = this.fb.group<RegionFilterVM>({
      year: undefined,
      provinceAnyCountyCity: undefined,
      townshipDistrict: undefined,
      village: undefined,
    });
    f.controls.year?.valueChanges.subscribe((year) => {
      if (!year) return;
      this.getVoteYearData(year).then(() => {
        f.controls.provinceAnyCountyCity?.patchValue(
          this.provinceAndCountryCityOptions.value[0],
        );
      });
    });

    f.controls.provinceAnyCountyCity?.valueChanges.subscribe((elbase) => {
      if (!elbase) return;

      f.controls.village?.patchValue(undefined);
      f.controls.townshipDistrict?.patchValue(undefined);

      this._getTownshipDistrictOptions(elbase);

      this._getTop3CandidateInfo(elbase);
      this._getVoteInfo(elbase);

      // this.displayElctkses.next(
      //   this._filterByCountry<Elctks>(this.elctks, elbase),
      // );
      // this.displayElprofs.next(
      //   this._filterByCountry<Elprof>(this.elprofs, elbase),
      // );
    });
    f.controls.townshipDistrict?.valueChanges.subscribe((elbase) => {
      if (!elbase) return;
      f.controls.village?.patchValue(undefined);

      this._getVillageOptions(elbase);
      this._getVoteInfo(elbase);

      // this.displayElctkses.next(
      //   this._filterByTown<Elctks>(this.elctks, elbase),
      // );
      // this.displayElprofs.next(
      //   this._filterByTown<Elprof>(this.elprofs, elbase),
      // );
    });

    f.controls.village?.valueChanges.subscribe((elbase) => {
      if (!elbase) return;
      // this.displayElctkses.next(
      //   this._filterByVillage<Elctks>(this.elctks, elbase),
      // );
      // this.displayElprofs.next(
      //   this._filterByVillage<Elprof>(this.elprofs, elbase),
      // );
    });
    this.searchForm = f;
  }

  /** 取得投票年度資料 */
  async getVoteYearData(year: VoteYearEnum) {
    this.currentVoteYear = year;
    this.elbases = await this.db.elbase.where({ year }).toArray();
    this._getProvinceAndCountryCityOptions();
    const elpatys = await this.db.elpaty.where({ year }).toArray();
    this.elpatysObj = this._parseElpatyObj(elpatys);
    this.elcands = await this.db.elcand.where({ year }).toArray();
    this.elprofs = await this.db.elprof.where({ year }).toArray();
    this.elctks = await this.db.elctks.where({ year }).toArray();
  }

  /** 取得前三名候選人資訊 */
  private _getTop3CandidateInfo(filterOption: Elbase) {
    const elctks = this._sortElctk(
      this._filterByVillage(this.elctks, filterOption),
    ).slice(0, 3);
    const top3CandidateInfo = elctks.map((elctk) => {
      const { voteCount, votePercentage, electedMark } = elctk;
      const { name, politicalPartyCode } = this.elcands.find(
        (cand) => cand.numberSequence === elctk.candidateNumber,
      ) as Elcand;
      const politicalPartyName = this.elpatysObj[+politicalPartyCode];
      return {
        name,
        voteCount,
        votePercentage,
        electedMark,
        politicalPartyName,
      };
    });
    this.top3CandidateInfo.next(top3CandidateInfo);
  }

  /** 取得投票資訊 */
  private _getVoteInfo(filterOption: Elbase) {
    console.log('elprof', this._filterByVillage(this.elprofs, filterOption)[0]);
    const { voterTurnout, validVotes, invalidVotes, totalVotes } =
      this._filterByVillage(this.elprofs, filterOption)[0];
    this.voteInfo.next({ voterTurnout, validVotes, invalidVotes, totalVotes });
  }

  /** 取得省市別選項 */
  private _getProvinceAndCountryCityOptions(): void {
    const elbases = this.elbases.filter(
      (elbase) =>
        // elbase.provinceCity !== '00' && // 排除全國
        elbase.electoralDistrict === '00' &&
        elbase.townshipDistrict === '000' &&
        elbase.village === '0000',
    );
    this.provinceAndCountryCityOptions.next(elbases);
  }

  /** 取得鄉鎮市區選項 */
  private _getTownshipDistrictOptions(filterOption: Elbase): void {
    this.townshipDistrictOptions.next(
      this._filterByCountry<Elbase>(this.elbases, filterOption),
    );
  }

  /** 取得村里別選項 */
  private _getVillageOptions(filterOption: Elbase): void {
    this.villageOptions.next(
      this._filterByTown<Elbase>(this.elbases, filterOption),
    );
  }

  /** 依省市別篩選資料 */
  private _filterByCountry<T>(
    datas: T[],
    { provinceCity, countyCity }: Elbase,
  ): T[] {
    return datas.filter(
      (data: any) =>
        data.townshipDistrict !== '000' && // 排除當前縣市
        data.provinceCity === provinceCity &&
        data.countyCity === countyCity &&
        data.village === '0000',
    );
  }

  /** 依鄉鎮市區篩選資料 */
  private _filterByTown<T>(
    datas: T[],
    { provinceCity, countyCity, townshipDistrict }: Elbase,
  ): T[] {
    return datas.filter(
      (data: any) =>
        data.provinceCity === provinceCity &&
        data.countyCity === countyCity &&
        data.townshipDistrict === townshipDistrict &&
        data.village !== '0000', // 排除當前鄉鎮市區
    );
  }

  /** 依村里別篩選資料 */
  private _filterByVillage<T>(
    datas: T[],
    { provinceCity, countyCity, townshipDistrict, village }: Elbase,
  ): T[] {
    return datas.filter(
      (data: any) =>
        data.provinceCity === provinceCity &&
        data.countyCity === countyCity &&
        data.townshipDistrict === townshipDistrict &&
        data.village === village,
    );
  }

  /** 政黨資料轉換成物件 */
  private _parseElpatyObj(elpatys: Elpaty[]): { [key: number]: string } {
    return elpatys.reduce(
      (patyObj, elpaty) => {
        patyObj[elpaty.politicalPartyCode] = elpaty.politicalPartyName;
        return patyObj;
      },
      {} as { [key: number]: string },
    );
  }

  private _sortElctk(elctks: Elctks[]) {
    return elctks.sort((a, b) => b.voteCount - a.voteCount);
  }
}
