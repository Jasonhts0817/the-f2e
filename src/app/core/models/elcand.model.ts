import { DeputyEnum } from '../enums/deputy.enum';
import { ElectedMarkEnum } from '../enums/elected-mark.enum';
import { GenderEnum } from '../enums/gender.enum';

/** 候選人得票 */
export class Elcand {
  /** 省市別
   *
   * 全國層級時，該省市別為00
   */
  provinceCity: string | undefined = undefined;
  /** 縣市別 */
  countyCity: string | undefined = undefined;
  /** 選區別 */
  electoralDistrict: string | undefined = undefined;
  /** 鄉鎮市區 */
  townshipDistrict: string | undefined = undefined;
  /** 村里別 */
  village: string | undefined = undefined;
  /** 號次 */
  numberSequence: number | undefined = undefined;
  /** 名字 */
  name: string | undefined = undefined;
  /** 政黨代號 */
  politicalPartyCode: string | undefined = undefined;
  /** 性別 1:男，2:女 */
  gender: GenderEnum | undefined = undefined;
  /**
   * 出生日期
   * 民國年月日，部分選舉資料僅有出生年
   */
  dateOfBirth: number | undefined = undefined;
  /**
   * 年齡
   *
   * (部分選舉未必有資料,可能0或99)
   */
  age: number | undefined = undefined;
  /**
   * 出生地
   *
   * (補選未必有資料)
   */
  placeOfBirth: string | undefined = undefined;
  /**
   * 學歷
   *
   * (補選未必有資料)
   */
  education: string | undefined = undefined;
  /**
   * 現任
   *
   * Y:現任，N:非現任
   */
  incumbent: 'Y' | 'N' | undefined = undefined;
  /**
   * 當選註記
   *
   * *:當選，“ “:未當選，!:婦女保障 -:因婦女保障被排擠未當選
   */
  electedMark: ElectedMarkEnum | undefined = undefined;
  /** 副手
   * Y:副總統，” “:其它候選人
   */
  deputy: DeputyEnum | undefined = undefined;

  constructor(data: any) {
    this.provinceCity = data[0];
    this.countyCity = data[1];
    this.electoralDistrict = data[2];
    this.townshipDistrict = data[3];
    this.village = data[4];
    this.numberSequence = data[5];
    this.name = data[6];
    this.politicalPartyCode = data[7];
    this.gender = data[8];
    this.dateOfBirth = data[9];
    this.age = data[10];
    this.placeOfBirth = data[11];
    this.education = data[12];
    this.incumbent = data[13];
    this.electedMark = data[14];
    this.deputy = data[15];
  }
}
