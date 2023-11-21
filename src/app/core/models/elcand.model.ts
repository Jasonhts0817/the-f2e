import { DeputyEnum } from '../enums/deputy.enum';
import { ElectedMarkEnum } from '../enums/elected-mark.enum';
import { GenderEnum } from '../enums/gender.enum';
import { VoteYearEnum } from '../enums/vote-year.enum';

/** 候選人資料 */
export class Elcand {
  id?: number;
  year: VoteYearEnum;
  /** 省市別
   *
   * 全國層級時，該省市別為00
   */
  provinceCity: string;
  /** 縣市別 */
  countyCity: string;
  /** 選區別 */
  electoralDistrict: string;
  /** 鄉鎮市區 */
  townshipDistrict: string;
  /** 村里別 */
  village: string;
  /** 號次 */
  numberSequence: number;
  /** 名字 */
  name: string;
  /** 政黨代號 */
  politicalPartyCode: string;
  /** 性別 1:男，2:女 */
  gender: GenderEnum;
  /**
   * 出生日期
   * 民國年月日，部分選舉資料僅有出生年
   */
  dateOfBirth: number;
  /**
   * 年齡
   *
   * (部分選舉未必有資料,可能0或99)
   */
  age?: number;
  /**
   * 出生地
   *
   * (補選未必有資料)
   */
  placeOfBirth?: string;
  /**
   * 學歷
   *
   * (補選未必有資料)
   */
  education?: string;
  /**
   * 現任
   *
   * Y:現任，N:非現任
   */
  incumbent: 'Y' | 'N';
  /**
   * 當選註記
   *
   * *:當選，“ “:未當選，!:婦女保障 -:因婦女保障被排擠未當選
   */
  electedMark: ElectedMarkEnum;
  /** 副手
   * Y:副總統，” “:其它候選人
   */
  deputy: DeputyEnum;

  constructor(data: any, year: VoteYearEnum) {
    this.year = year;
    this.provinceCity = data[0].trim();
    this.countyCity = data[1].trim();
    this.electoralDistrict = data[2].trim();
    this.townshipDistrict = data[3].trim();
    this.village = data[4].trim();
    this.numberSequence = data[5].trim();
    this.name = data[6].trim();
    this.politicalPartyCode = data[7].trim();
    this.gender = data[8].trim();
    this.dateOfBirth = data[9].trim();
    this.age = data[10].trim();
    this.placeOfBirth = data[11].trim();
    this.education = data[12].trim();
    this.incumbent = data[13].trim();
    this.electedMark = data[14].trim();
    this.deputy = data[15].trim();
  }
}
