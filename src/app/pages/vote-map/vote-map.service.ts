import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { VoteYearEnum } from 'src/app/core/enums/vote-year.enum';
import { Elbase } from 'src/app/core/models/elbase.model';
import { Elcand } from 'src/app/core/models/elcand.model';
import { Elctks } from 'src/app/core/models/elctks.model';
import { Elpaty } from 'src/app/core/models/elpaty.model';
import { Elprof } from 'src/app/core/models/elprof.model';
import Dexie from 'dexie';
import {
  AreaVoteInfoVM,
  CandidateInfoVM,
  HistoryPartyInfoVM,
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
  currentYear = VoteYearEnum._1996;

  elpatysObj: { [key: number]: string } = {};
  genderObject: { [key: number]: string } = { 1: '男', 2: '女' };

  top3CandidateInfo = new BehaviorSubject<CandidateInfoVM[]>([]);
  voteInfo = new BehaviorSubject<VoteInfoVM | undefined>(undefined);
  historyPartyInfos = new BehaviorSubject<HistoryPartyInfoVM[]>([]);
  areaVoteInfoVM = new BehaviorSubject<AreaVoteInfoVM[]>([]);

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
      this.currentYear = year;
      this.getVoteYearData(year).then(() => {
        f.controls.provinceAnyCountyCity?.patchValue(
          this.provinceAndCountryCityOptions.value[0],
        );
      });
    });

    f.controls.provinceAnyCountyCity?.valueChanges.subscribe(async (elbase) => {
      if (!elbase) return;

      f.controls.village?.patchValue(undefined);
      f.controls.townshipDistrict?.patchValue(undefined);

      const options = await this._getTownshipDistrictOptions(elbase);
      this.townshipDistrictOptions.next(options);

      this._getTop3CandidateInfo(elbase);
      this._getVoteInfo(elbase);
      this._getHistoryPartyInfo(elbase.name);
      this._getAreaVoteInfo(options);
    });
    f.controls.townshipDistrict?.valueChanges.subscribe(async (elbase) => {
      if (!elbase) return;
      f.controls.village?.patchValue(undefined);

      const options = await this._getVillageOptions(elbase);
      this.villageOptions.next(options);

      this._getTop3CandidateInfo(elbase);
      this._getVoteInfo(elbase);
      this._getHistoryPartyInfo(elbase.name);
      this._getAreaVoteInfo(options);
    });

    f.controls.village?.valueChanges.subscribe((elbase) => {
      if (!elbase) return;
      this._getTop3CandidateInfo(elbase);
      this._getVoteInfo(elbase);
      this._getHistoryPartyInfo(elbase.name);
      this._getAreaVoteInfo([elbase]);
    });
    this.searchForm = f;
  }

  /** 取得投票年度資料 */
  async getVoteYearData(year: VoteYearEnum) {
    this.currentYear = year;
    const options = await this._getProvinceAndCountryCityOptions();
    this.provinceAndCountryCityOptions.next(options);
    const elpatys = await this.db.elpaty.where({ year }).toArray();
    this.elpatysObj = this._parseElpatyObj(elpatys);
  }

  /** 取得前三名候選人資訊 */
  private async _getTop3CandidateInfo({
    provinceCity,
    countyCity,
    townshipDistrict,
    village,
  }: Elbase) {
    const elctks = await this.db.elctks
      .where('[year+provinceCity+countyCity]')
      .equals([this.currentYear, provinceCity, countyCity])
      .and(
        (elctks) =>
          elctks.townshipDistrict === townshipDistrict &&
          elctks.village === village,
      )
      .reverse()
      .sortBy('voteCount');
    const elcands = await this.db.elcand
      .where({ year: this.currentYear })
      .toArray();

    const top3CandidateInfo = elctks.slice(0, 3).map((elctk) => {
      const { voteCount, votePercentage, electedMark } = elctk;
      const { name, politicalPartyCode } = elcands.find(
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
  private async _getVoteInfo({
    provinceCity,
    countyCity,
    townshipDistrict,
    village,
  }: Elbase) {
    const elprof = (await this.db.elprof
      .where('[year+provinceCity+countyCity]')
      .equals([this.currentYear, provinceCity, countyCity])
      .and(
        (elbase) =>
          elbase.townshipDistrict === townshipDistrict &&
          elbase.village === village,
      )
      .first()) as Elprof;

    if (!elprof) return;
    const { voterTurnout, validVotes, invalidVotes, totalVotes } = elprof;
    this.voteInfo.next({ voterTurnout, validVotes, invalidVotes, totalVotes });
  }

  /** 取得歷屆政黨投票資訊 */
  private async _getHistoryPartyInfo(areaName: string) {
    const historyPartyInfos = await Promise.all(
      Object.values(VoteYearEnum).map(async (year) => {
        const elbase = (await this.db.elbase
          .where('[year+name]')
          .equals([year, areaName])
          .first()) as Elbase;
        if (!elbase) return;
        const elcands = await this.db.elcand.where({ year }).toArray();
        const elpaties = await this.db.elpaty.where({ year }).toArray();
        const elctks = await this.db.elctks
          .where('[year+provinceCity+countyCity]')
          .equals([year, elbase?.provinceCity, elbase?.countyCity])
          .and(
            (elctks) =>
              elctks.townshipDistrict === elbase.townshipDistrict &&
              elctks.village === elbase.village &&
              (elctks.pollingStation === '0000' ||
                elctks.pollingStation === '0'),
          )
          .toArray();
        const partyVoteInfos: any[] = [];

        elctks
          .sort((a, b) => +b.voteCount - +a.voteCount)
          .forEach((elctk) => {
            const elcand = elcands.find(
              ({ numberSequence }) => numberSequence === elctk.candidateNumber,
            ) as Elcand;
            if (!elcand) return;
            const elpaty = elpaties.find(
              ({ politicalPartyCode }) =>
                elcand.politicalPartyCode === politicalPartyCode,
            );

            if (partyVoteInfos.length < 3) {
              const politicalPartyName =
                partyVoteInfos.length < 2 ? elpaty?.politicalPartyName : '其他';
              partyVoteInfos.push({
                politicalPartyName,
                votePercentage: +elctk.votePercentage,
                voteCount: +elctk.voteCount,
              });
            } else {
              partyVoteInfos[2].votePercentage += +elctk.votePercentage;
              partyVoteInfos[2].voteCount += +elctk.voteCount;
            }
          });
        return {
          year,
          partyVoteInfos,
        } as HistoryPartyInfoVM;
      }),
    );
    this.historyPartyInfos.next(historyPartyInfos as HistoryPartyInfoVM[]);
  }

  /** 取得區域投票資訊 */
  private async _getAreaVoteInfo(elbases: Elbase[]) {
    const allElbase = elbases.shift() as Elbase;
    const elcands = await this.db.elcand
      .where({ year: this.currentYear })
      .toArray();
    const elpaties = await this.db.elpaty
      .where({ year: this.currentYear })
      .toArray();
    const elprofs = await this.db.elprof
      .where('[year+provinceCity+countyCity]')
      .equals([this.currentYear, allElbase.provinceCity, allElbase.countyCity])
      .toArray();
    const elctks = await this.db.elctks
      .where('[year+provinceCity+countyCity]')
      .equals([this.currentYear, allElbase.provinceCity, allElbase.countyCity])
      .toArray();

    const areaVoteInfoVM = elbases.map((elbase) => {
      const { townshipDistrict, village, name } = elbase;
      const elprof = elprofs.find(
        (elprof) =>
          elprof.townshipDistrict == townshipDistrict &&
          elprof.village === village &&
          (elprof.pollingStation === '0000' || elprof.pollingStation === '0'),
      ) as Elprof;
      const subElctks = elctks
        .filter(
          (elctk) =>
            elctk.townshipDistrict == townshipDistrict &&
            elctk.village === village &&
            (elctk.pollingStation === '0000' || elctk.pollingStation === '0'),
        )
        .sort((a, b) => +b.voteCount - +a.voteCount);
      const electedCand = elcands.find(
        (elcand) => elcand.numberSequence === subElctks[0].candidateNumber,
      ) as Elcand;
      const partyVoteInfos: any[] = [];
      subElctks.map((elctk) => {
        const elcand = elcands.find(
          ({ numberSequence }) => numberSequence === elctk.candidateNumber,
        ) as Elcand;
        if (!elcand) return;
        const elpaty = elpaties.find(
          ({ politicalPartyCode }) =>
            elcand.politicalPartyCode === politicalPartyCode,
        );

        if (partyVoteInfos.length < 3) {
          const politicalPartyName =
            partyVoteInfos.length < 2 ? elpaty?.politicalPartyName : '其他';
          partyVoteInfos.push({
            politicalPartyName,
            votePercentage: +elctk.votePercentage,
          });
        } else {
          partyVoteInfos[2].votePercentage += +elctk.votePercentage;
        }
      });

      return {
        areaName: name,
        totalVotes: elprof.totalVotes,
        voterTurnout: elprof.voterTurnout,
        partyVoteInfos,
        electedName: electedCand.name,
      };
    });
    this.areaVoteInfoVM.next(areaVoteInfoVM);
  }

  /** 取得省市別選項 */
  private async _getProvinceAndCountryCityOptions() {
    const elbases = await this.db.elbase
      .where('[year+townshipDistrict+village]')
      .equals([this.currentYear, '000', '0000'])
      .toArray();

    const allIndex = elbases.findIndex(
      (elbase) => elbase.provinceCity === '00' && elbase.countyCity === '000',
    );
    const allElbase = elbases.splice(allIndex, 1)[0];
    return [allElbase, ...elbases];
  }

  /** 取得鄉鎮市區選項 */
  private async _getTownshipDistrictOptions({
    provinceCity,
    countyCity,
  }: Elbase) {
    const elbases = await this.db.elbase
      .where('[year+provinceCity+countyCity]')
      .equals([this.currentYear, provinceCity, countyCity])
      .and((elbase) => elbase.village === '0000')
      .toArray();

    const allIndex = elbases.findIndex((elbase) => elbase.village === '0000');
    const allElbase = elbases.splice(allIndex, 1)[0];
    return [allElbase, ...elbases];
  }

  /** 取得村里別選項 */
  private async _getVillageOptions({
    provinceCity,
    countyCity,
    townshipDistrict,
  }: Elbase) {
    const elbases = await this.db.elbase
      .where('[year+provinceCity+countyCity]')
      .equals([this.currentYear, provinceCity, countyCity])
      .and((elbase) => elbase.townshipDistrict === townshipDistrict)
      .toArray();

    const allIndex = elbases.findIndex((elbase) => elbase.village === '0000');
    const allElbase = elbases.splice(allIndex, 1)[0];
    return [allElbase, ...elbases];
  }

  /** 政黨資料轉換成物件 */
  private _parseElpatyObj(elpatys: Elpaty[]): { [key: number]: string } {
    return elpatys.reduce(
      (patyObj, elpaty) => {
        patyObj[elpaty.politicalPartyCode] = elpaty.politicalPartyName;
        return patyObj;
      },
      {} as { [key: string]: string },
    );
  }
}
