import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { VoteYearEnum } from '../enums/vote-year.enum';
import { Elprof } from '../models/elprof.model';
import { map } from 'rxjs';
import { Elctks } from '../models/elctks.model';
import { Elbase } from '../models/elbase.model';
import { Elcand } from '../models/elcand.model';
import { Elpaty } from '../models/elpaty.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  /** 行政區基本資料 */
  getElbase(year: VoteYearEnum) {
    return this.http
      .get<Elbase[]>(`/assets/api/president/${year}/elbase.json`)
      .pipe(map((datas) => datas.map((data) => new Elbase(data))));
  }
  /** 候選人得票 */
  getElcand(year: VoteYearEnum) {
    return this.http
      .get<Elcand[]>(`/assets/api/president/${year}/elcand.json`)
      .pipe(map((datas) => datas.map((data) => new Elcand(data))));
  }
  /** 政黨基本資料 */
  getElpaty(year: VoteYearEnum) {
    return this.http
      .get<Elpaty[]>(`/assets/api/president/${year}/elpaty.json`)
      .pipe(map((datas) => datas.map((data) => new Elpaty(data))));
  }
  /** 取得選舉概況 */
  getElprof(year: VoteYearEnum) {
    return this.http
      .get<Elprof[]>(`/assets/api/president/${year}/elprof.json`)
      .pipe(map((datas) => datas.map((data) => new Elprof(data))));
  }
  /** 取得選舉概況 */
  getElctks(year: VoteYearEnum) {
    return this.http
      .get<Elctks[]>(`/assets/api/president/${year}/elctks.json`)
      .pipe(map((datas) => datas.map((data) => new Elctks(data))));
  }
}
