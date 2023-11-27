import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { VoteYearEnum } from '../enums/vote-year.enum';
import { Elprof } from '../models/elprof.model';
import { map } from 'rxjs';
import { Elctks } from '../models/elctks.model';
import { Elbase } from '../models/elbase.model';
import { Elcand } from '../models/elcand.model';
import { Elpaty } from '../models/elpaty.model';
import { environment } from 'src/environments/environment';
import { TaiwanMap } from '../models/map.model';
import { Elpinf } from '../models/elpinf.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  /** 取得行政區基本資料 */
  getElbase(year: VoteYearEnum) {
    return this.http
      .get<Elbase[]>(`${environment.apiUrl}/api/president/${year}/elbase.json`)
      .pipe(map((datas) => datas.map((data) => new Elbase(data, year))));
  }
  /** 取得候選人資料 */
  getElcand(year: VoteYearEnum) {
    return this.http
      .get<Elcand[]>(`${environment.apiUrl}/api/president/${year}/elcand.json`)
      .pipe(map((datas) => datas.map((data) => new Elcand(data, year))));
  }
  /** 取得政黨基本資料 */
  getElpaty(year: VoteYearEnum) {
    return this.http
      .get<Elpaty[]>(`${environment.apiUrl}/api/president/${year}/elpaty.json`)
      .pipe(map((datas) => datas.map((data) => new Elpaty(data, year))));
  }
  /** 取得選舉概況 */
  getElprof(year: VoteYearEnum) {
    return this.http
      .get<Elprof[]>(`${environment.apiUrl}/api/president/${year}/elprof.json`)
      .pipe(map((datas) => datas.map((data) => new Elprof(data, year))));
  }
  /** 取得候選人得票檔 */
  getElctks(year: VoteYearEnum) {
    return this.http
      .get<Elctks[]>(`${environment.apiUrl}/api/president/${year}/elctks.json`)
      .pipe(map((datas) => datas.map((data) => new Elctks(data, year))));
  }

  /** 取得候選人得票檔 */
  getElPinf(year: VoteYearEnum) {
    return this.http
      .get<Elpinf[]>(`${environment.apiUrl}/api/president/${year}/elpinf.json`)
      .pipe(map((datas) => datas.map((data) => new Elpinf(data, year))));
  }

  /** 取得縣市地圖 */
  getCountryJson(year: VoteYearEnum) {
    let url = '';

    switch (year) {
      case VoteYearEnum._1996:
      case VoteYearEnum._2000:
      case VoteYearEnum._2004:
      case VoteYearEnum._2008:
        url = `${environment.apiUrl}/api/map/1982/counties.json`;
        break;
      case VoteYearEnum._2012:
        url = `${environment.apiUrl}/api/map/2012/counties.json`;
        break;
      case VoteYearEnum._2016:
      case VoteYearEnum._2020:
        url = `${environment.apiUrl}/api/map/2016/counties.json`;
        break;
    }
    return this.http
      .get<TaiwanMap>(url)
      .pipe(map((data) => new TaiwanMap(data)));
  }

  /** 取得鄉鎮市區地圖 */
  getTownJson(year: VoteYearEnum, townNo: string) {
    let url = '';

    switch (year) {
      case VoteYearEnum._1996:
      case VoteYearEnum._2000:
      case VoteYearEnum._2004:
      case VoteYearEnum._2008:
        url = `${environment.apiUrl}/api/map/1982/towns/towns-${townNo}.json`;
        break;
      case VoteYearEnum._2012:
        url = `${environment.apiUrl}/api/map/2012/towns/towns-${townNo}.json`;
        break;
      case VoteYearEnum._2016:
      case VoteYearEnum._2020:
        url = `${environment.apiUrl}/api/map/2016/towns/towns-${townNo}.json`;
        break;
    }
    return this.http
      .get<TaiwanMap>(url)
      .pipe(map((data) => new TaiwanMap(data)));
  }
}
