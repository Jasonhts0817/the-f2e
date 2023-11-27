import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { VoteYearEnum } from 'src/app/core/enums/vote-year.enum';
import { Elbase } from 'src/app/core/models/elbase.model';
import { Elcand } from 'src/app/core/models/elcand.model';
import { Elctks } from 'src/app/core/models/elctks.model';
import { Elpaty } from 'src/app/core/models/elpaty.model';
import { Elprof } from 'src/app/core/models/elprof.model';

import {
  AreaVoteInfoVM,
  CandidateInfoVM,
  HistoryPartyInfoVM,
  RegionFilterVM,
  VoteInfoVM,
} from './vote-map.view-model';
import { DbService } from 'src/app/core/service/db.service';
import { DeputyEnum } from 'src/app/core/enums/deputy.enum';

@Injectable({
  providedIn: 'root',
})
export class VoteMapService {
  searchForm?: FormGroup;

  VoteYearEnum = VoteYearEnum;
  currentYear = VoteYearEnum._2020;

  genderObject: { [key: number]: string } = { 1: '男', 2: '女' };

  top3CandidateInfo = new BehaviorSubject<CandidateInfoVM[]>([]);
  voteInfo = new BehaviorSubject<VoteInfoVM | undefined>(undefined);
  historyPartyInfos = new BehaviorSubject<HistoryPartyInfoVM[]>([]);
  countryVoteInfoVM = new BehaviorSubject<AreaVoteInfoVM[]>([]);
  areaVoteInfoVM = new BehaviorSubject<AreaVoteInfoVM[]>([]);

  regionFilterFormGroup!: FormGroup;
  provinceAndCountryCityOptions = new BehaviorSubject<Elbase[]>([]);
  townshipDistrictOptions = new BehaviorSubject<Elbase[]>([]);
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
    });
    f.controls.year?.valueChanges.subscribe(async (year) => {
      if (!year) return;
      this.currentYear = year;
      await this.db.downloadYearVoteData(year).then(() => {
        this.getVoteYearData(year);
      });
    });

    f.controls.provinceAnyCountyCity?.valueChanges.subscribe(async (elbase) => {
      if (!elbase) return;

      f.controls.townshipDistrict?.patchValue(undefined);

      const options = await this._getTownshipDistrictOptions(elbase);
      this.townshipDistrictOptions.next(options);

      this._getVoteInfo(elbase);
      this._getTop3CandidateInfo(elbase).then(() => {
        this._getHistoryPartyInfo(elbase.name);
        if (elbase.provinceCity === '00' && elbase.countyCity === '000') {
          this._getCountryVoteInfo(
            this.provinceAndCountryCityOptions.value,
          ).then(() => {
            this.countryVoteInfoVM.next(this.areaVoteInfoVM.value);
          });
        } else {
          this._getAreaVoteInfo(options);
        }
      });
    });
    f.controls.townshipDistrict?.valueChanges.subscribe(async (elbase) => {
      if (!elbase) return;

      const options = await this._getVillageOptions(elbase);

      this._getVoteInfo(elbase);
      this._getTop3CandidateInfo(elbase).then(() => {
        this._getHistoryPartyInfo(elbase.name);
        this._getAreaVoteInfo(options);
      });
    });

    this.searchForm = f;
  }

  /** 取得投票年度資料 */
  async getVoteYearData(year: VoteYearEnum) {
    this.currentYear = year;
    this._getProvinceAndCountryCityOptions().then((options) => {
      this.provinceAndCountryCityOptions.next(options);
      this.searchForm?.controls['provinceAnyCountyCity'].patchValue(options[0]);
      this._getAreaVoteInfo(options);
    });
  }

  /** 取得前三名候選人資訊 */
  private async _getTop3CandidateInfo({
    provinceCity,
    countyCity,
    townshipDistrict,
    village,
  }: Elbase) {
    const elpaties = await this.db.elpaty
      .where({ year: this.currentYear })
      .toArray();
    const elctks = await this.db.elctks
      .where('[year+townshipDistrict+village]')
      .equals([this.currentYear, townshipDistrict, village])
      .and(
        (elctks) =>
          elctks.provinceCity === provinceCity &&
          elctks.countyCity === countyCity,
      )
      .toArray();
    const elcands = await this.db.elcand
      .where({ year: this.currentYear })
      .toArray();

    const top3CandidateInfo = elctks
      .sort((a, b) => +b.voteCount - +a.voteCount)
      .slice(0, 3)
      .map((elctk) => {
        const { voteCount, votePercentage, electedMark } = elctk;
        const { name, politicalPartyCode } = elcands.find(
          (cand) => cand.numberSequence === elctk.candidateNumber,
        ) as Elcand;
        const elpaty = elpaties.find(
          (p) => p.politicalPartyCode === politicalPartyCode,
        ) as Elpaty;
        const politicalPartyName = elpaty?.politicalPartyName;
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
        const elpinfs = await this.db.elpinf
          .where('[year+townshipDistrict+village]')
          .equals([year, elbase?.townshipDistrict, elbase?.village])
          .and(
            (elpinf) =>
              elpinf.provinceCity === elbase.provinceCity &&
              elpinf.countyCity === elbase.countyCity,
          )
          .toArray();

        return this.top3CandidateInfo.value
          .map((cand) => {
            const elpinf = elpinfs.find(
              (info) => info.politicalPartyName === cand.politicalPartyName,
            );
            if (!elpinf) return;
            return {
              year,
              politicalPartyName: elpinf.politicalPartyName,
              votePercentage: elpinf.votePercentage,
              voteCount: elpinf.voteCount,
            };
          })
          .filter(Boolean);
      }),
    );
    this.historyPartyInfos.next(
      historyPartyInfos.flat() as HistoryPartyInfoVM[],
    );
  }

  /** 取得縣市投票資訊 */
  private async _getCountryVoteInfo(elbases: Elbase[]) {
    const allElbase = elbases[0] as Elbase;
    const elpaties = await this.db.elpaty
      .where({ year: this.currentYear })
      .toArray();
    const elcands = await this.db.elcand
      .where({ year: this.currentYear })
      .toArray();
    const elprofs = await this.db.elprof
      .where('[year+townshipDistrict+village]')
      .equals([this.currentYear, allElbase.townshipDistrict, allElbase.village])
      .toArray();
    const elctks = await this.db.elctks
      .where('[year+townshipDistrict+village]')
      .equals([this.currentYear, allElbase.townshipDistrict, allElbase.village])
      .toArray();

    const areaVoteInfoVM = elbases.map((elbase) => {
      const { provinceCity, countyCity, name } = elbase;
      const elprof = elprofs.find(
        (elprof) =>
          elprof.provinceCity == provinceCity &&
          elprof.countyCity === countyCity &&
          (elprof.pollingStation === '0000' || elprof.pollingStation === '0'),
      ) as Elprof;
      const subElctks = elctks
        .filter(
          (elctk) =>
            elctk.provinceCity == provinceCity &&
            elctk.countyCity === countyCity &&
            (elctk.pollingStation === '0000' || elctk.pollingStation === '0'),
        )
        .sort((a, b) => +b.voteCount - +a.voteCount);
      const electedCand = elcands.find(
        (elcand) => elcand.numberSequence === subElctks[0].candidateNumber,
      ) as Elcand;
      const elpaty = elpaties.find(
        (party) => party.politicalPartyCode === electedCand.politicalPartyCode,
      ) as Elpaty;

      const partyVoteInfos = this.top3CandidateInfo.value
        .map((cand) => {
          const elpaty = elpaties.find(
            ({ politicalPartyName }) =>
              cand.politicalPartyName === politicalPartyName,
          );
          if (!elpaty) return;
          const partyInfo = {
            candName: cand.name,
            votePercentage: 0,
          };
          elcands
            .filter(
              (elcand) =>
                elcand.politicalPartyCode === elpaty?.politicalPartyCode &&
                elcand.deputy !== DeputyEnum.VicePresident,
            )
            .map((elcand) => {
              const elctk = subElctks.find(
                (elctk) => elctk.candidateNumber === elcand.numberSequence,
              );
              if (!elctk) return;
              partyInfo.votePercentage =
                +elctk.votePercentage + +partyInfo.votePercentage;
            });
          return partyInfo.votePercentage ? partyInfo : undefined;
        })
        .filter(Boolean) as {
        candName: string;
        votePercentage: number;
      }[];

      return {
        areaName: name,
        totalVotes: elprof.totalVotes,
        voterTurnout: elprof.voterTurnout,
        partyVoteInfos,
        electedName: electedCand.name,
        electedPartyName: elpaty.politicalPartyName,
      };
    });
    if (areaVoteInfoVM.length > 1) {
      areaVoteInfoVM.shift();
    }

    this.areaVoteInfoVM.next(areaVoteInfoVM);
  }

  /** 取得區域投票資訊 */
  private async _getAreaVoteInfo(elbases: Elbase[]) {
    const allElbase = elbases[0] as Elbase;
    const elpaties = await this.db.elpaty
      .where({ year: this.currentYear })
      .toArray();
    const elcands = await this.db.elcand
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

    const areaVoteInfoVM = elbases
      .map((elbase, i) => {
        if (i === 0) return;
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
        const elpaty = elpaties.find(
          (party) =>
            party.politicalPartyCode === electedCand.politicalPartyCode,
        ) as Elpaty;

        const partyVoteInfos = this.top3CandidateInfo.value
          .map((cand) => {
            const elpaty = elpaties.find(
              ({ politicalPartyName }) =>
                cand.politicalPartyName === politicalPartyName,
            );
            if (!elpaty) return;
            const partyInfo = {
              candName: cand.name,
              votePercentage: 0,
            };
            elcands
              .filter(
                (elcand) =>
                  elcand.politicalPartyCode === elpaty?.politicalPartyCode &&
                  elcand.deputy !== DeputyEnum.VicePresident,
              )
              .map((elcand) => {
                const elctk = subElctks.find(
                  (elctk) => elctk.candidateNumber === elcand.numberSequence,
                );
                if (!elctk) return;
                partyInfo.votePercentage =
                  +elctk.votePercentage + +partyInfo.votePercentage;
              });
            return partyInfo.votePercentage ? partyInfo : undefined;
          })
          .filter(Boolean) as {
          candName: string;
          votePercentage: number;
        }[];

        return {
          areaName: name,
          totalVotes: elprof.totalVotes,
          voterTurnout: elprof.voterTurnout,
          partyVoteInfos,
          electedName: electedCand.name,
          electedPartyName: elpaty.politicalPartyName,
        };
      })
      .filter(Boolean) as AreaVoteInfoVM[];

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

    const allIndex = elbases.findIndex(
      (elbase) => elbase.townshipDistrict === '000',
    );
    const allElbase = elbases.splice(allIndex, 1)[0];
    return [allElbase, ...elbases];
  }
}
