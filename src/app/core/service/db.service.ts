import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { Elbase } from '../models/elbase.model';
import { Elcand } from '../models/elcand.model';
import { Elctks } from '../models/elctks.model';
import { Elpaty } from '../models/elpaty.model';
import { Elprof } from '../models/elprof.model';
import { ApiService } from './api.service';
import { VoteYearEnum } from '../enums/vote-year.enum';
import { forkJoin, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DbService extends Dexie {
  elbase!: Table<Elbase, number>;
  elcand!: Table<Elcand, number>;
  elctks!: Table<Elctks, number>;
  elpaty!: Table<Elpaty, number>;
  elprof!: Table<Elprof, number>;

  constructor(private apiService: ApiService) {
    super('ngdexieliveQuery');
    this.version(1).stores({
      elbase: '++id, year, provinceCity, countyCity, townshipDistrict, village',
      elcand: '++id, year',
      elctks: '++id, year, provinceCity, countyCity, townshipDistrict, village',
      elpaty: '++id, year',
      elprof: '++id, year, provinceCity, countyCity, townshipDistrict, village',
    });
    this.on('populate', () => this.populate());
  }

  async populate() {
    const reqs = Object.values(VoteYearEnum)
      .map((voteYear) => [
        this.apiService
          .getElbase(voteYear)
          .pipe(map((elbase) => this.elbase.bulkAdd(elbase))),
        this.apiService
          .getElpaty(voteYear)
          .pipe(map((elpaty) => this.elpaty.bulkAdd(elpaty))),
        this.apiService
          .getElcand(voteYear)
          .pipe(map((elcand) => this.elcand.bulkAdd(elcand))),
        this.apiService
          .getElprof(voteYear)
          .pipe(map((elprof) => this.elprof.bulkAdd(elprof))),
        this.apiService
          .getElctks(voteYear)
          .pipe(map((elctks) => this.elctks.bulkAdd(elctks))),
      ])
      .flat();

    forkJoin(reqs).subscribe();
  }
}
