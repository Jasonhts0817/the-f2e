import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { Elbase } from '../models/elbase.model';
import { Elcand } from '../models/elcand.model';
import { Elctks } from '../models/elctks.model';
import { Elpaty } from '../models/elpaty.model';
import { Elprof } from '../models/elprof.model';
import { ApiService } from './api.service';
import { VoteYearEnum } from '../enums/vote-year.enum';
import { forkJoin, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DbService extends Dexie {
  elbase!: Table<Elbase, number>;
  elcand!: Table<Elcand, number>;
  elctks!: Table<Elctks, number>;
  elpaty!: Table<Elpaty, number>;
  elprof!: Table<Elprof, number>;

  voteDataQueryQueue = ['1996', '2000', '2004', '2008', '2012', '2016', '2020'];

  constructor(private apiService: ApiService) {
    super('ngdexieliveQuery');
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
  async downloadVoteData(voteYear: VoteYearEnum): Promise<boolean> {
    if (!voteYear) return false;
    const reqs = [
      await this.fetchElbase(voteYear),
      await this.fetchElcand(voteYear),
      await this.fetchElpaty(voteYear),
      await this.fetchElprof(voteYear),
      await this.fetchElctks(voteYear),
    ];
    return new Promise((resolve) => {
      forkJoin(reqs).subscribe({
        complete: () => {
          this.voteDataQueryQueue = this.voteDataQueryQueue.filter(
            (year) => year != voteYear,
          );
          setTimeout(() => {
            this.downloadVoteData(
              this.voteDataQueryQueue.shift() as VoteYearEnum,
            );
          }, 10000);

          resolve(true);
        },
      });
    });
  }
  async fetchElbase(voteYear: VoteYearEnum) {
    const elbase = await this.elbase.where({ year: voteYear }).first();
    console.log('elbase', elbase);
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

  addDataByWebWorker(tableName: string, results: any) {
    if (typeof Worker !== 'undefined') {
      // Create a new
      const worker = new Worker(new URL('../../app.worker', import.meta.url));
      worker.onmessage = ({ data }) => {
        console.log(`page got message: ${data}`);
      };
      worker.postMessage({ type: 'indexedDb', tableName, results });
    }
  }
}
