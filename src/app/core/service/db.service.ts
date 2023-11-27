import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { Elbase } from '../models/elbase.model';
import { Elcand } from '../models/elcand.model';
import { Elctks } from '../models/elctks.model';
import { Elpaty } from '../models/elpaty.model';
import { Elprof } from '../models/elprof.model';
import { ApiService } from './api.service';
import { VoteYearEnum } from '../enums/vote-year.enum';
import { concatMap, from, map, mergeMap, of } from 'rxjs';
import { Elpinf } from '../models/elpinf.model';

@Injectable({
  providedIn: 'root',
})
export class DbService extends Dexie {
  elbase!: Table<Elbase, number>;
  elcand!: Table<Elcand, number>;
  elctks!: Table<Elctks, number>;
  elpaty!: Table<Elpaty, number>;
  elprof!: Table<Elprof, number>;
  elpinf!: Table<Elpinf, number>;

  constructor(private apiService: ApiService) {
    super('ngdexieliveQuery');
    this.version(2).stores({
      elpinf:
        '++id, [year+provinceCity+countyCity], [year+townshipDistrict+village]',
    });
    this.version(1).stores({
      elbase:
        '++id, [year+name], [year+provinceCity+countyCity], [year+townshipDistrict+village]',
      elcand: '++id, year',
      elctks:
        '++id, [year+provinceCity+countyCity], [year+townshipDistrict+village]',
      elpaty: '++id, year',
      elprof:
        '++id, [year+provinceCity+countyCity], [year+townshipDistrict+village]',
    });
    this.on('populate', () => this.populate());
  }
  async populate() {}
  async downloadYearVoteData(voteYear: VoteYearEnum) {
    if (!voteYear) return false;
    const reqs = [
      await this.fetchElcand(voteYear),
      await this.fetchElpaty(voteYear),
      await this.fetchElprof(voteYear),
      await this.fetchElctks(voteYear),
    ];
    return new Promise((resolve) => {
      from(reqs)
        .pipe(mergeMap((res) => res))
        .subscribe({
          complete: () => setTimeout(() => resolve(true), 2000),
        });
    });
  }
  async downloadElbase() {
    const reqs = [
      await this.fetchElbase(VoteYearEnum._1996),
      await this.fetchElbase(VoteYearEnum._2000),
      await this.fetchElbase(VoteYearEnum._2004),
      await this.fetchElbase(VoteYearEnum._2008),
      await this.fetchElbase(VoteYearEnum._2012),
      await this.fetchElbase(VoteYearEnum._2016),
      await this.fetchElbase(VoteYearEnum._2020),
    ];
    from(reqs)
      .pipe(mergeMap((res) => res))
      .subscribe();
  }
  async downloadElpinf() {
    const reqs = [
      await this.fetchElpinf(VoteYearEnum._1996),
      await this.fetchElpinf(VoteYearEnum._2000),
      await this.fetchElpinf(VoteYearEnum._2004),
      await this.fetchElpinf(VoteYearEnum._2008),
      await this.fetchElpinf(VoteYearEnum._2012),
      await this.fetchElpinf(VoteYearEnum._2016),
      await this.fetchElpinf(VoteYearEnum._2020),
    ];
    from(reqs)
      .pipe(mergeMap((res) => res))
      .subscribe();
  }
  async fetchElbase(voteYear: VoteYearEnum) {
    const elbase = await this.elbase.where({ year: voteYear }).first();
    return elbase
      ? of()
      : this.apiService
          .getElbase(voteYear)
          .pipe(map((elbase) => this.addDataByWebWorker('elbase', elbase)));
  }
  async fetchElpaty(voteYear: VoteYearEnum) {
    const elpaty = await this.elpaty.where({ year: voteYear }).first();
    return elpaty
      ? of()
      : this.apiService
          .getElpaty(voteYear)
          .pipe(map((elpaty) => this.addDataByWebWorker('elpaty', elpaty)));
  }
  async fetchElcand(voteYear: VoteYearEnum) {
    const elcand = await this.elcand.where({ year: voteYear }).first();
    return elcand
      ? of()
      : this.apiService
          .getElcand(voteYear)
          .pipe(map((elcand) => this.addDataByWebWorker('elcand', elcand)));
  }

  async fetchElprof(voteYear: VoteYearEnum) {
    const elprof = await this.elprof.where({ year: voteYear }).first();
    return elprof
      ? of()
      : this.apiService
          .getElprof(voteYear)
          .pipe(map((elprof) => this.addDataByWebWorker('elprof', elprof)));
  }

  async fetchElctks(voteYear: VoteYearEnum) {
    const elctk = await this.elctks.where({ year: voteYear }).first();
    return elctk
      ? of()
      : this.apiService
          .getElctks(voteYear)
          .pipe(map((elctks) => this.addDataByWebWorker('elctks', elctks)));
  }

  async fetchElpinf(voteYear: VoteYearEnum) {
    const elpinf = await this.elpinf.where({ year: voteYear }).first();
    return elpinf
      ? of()
      : this.apiService
          .getElPinf(voteYear)
          .pipe(map((elpinf) => this.addDataByWebWorker('elpinf', elpinf)));
  }

  addDataByWebWorker(tableName: string, results: any) {
    if (typeof Worker !== 'undefined') {
      const worker = new Worker(new URL('../../app.worker', import.meta.url));
      worker.onmessage = ({ data }) => {};
      worker.postMessage({ type: 'indexedDb', tableName, results });
    }
  }
}
