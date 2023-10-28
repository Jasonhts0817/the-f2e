import { DeputyEnum } from '../enums/deputy.enum';
import { ElectedMarkEnum } from '../enums/electedMark.enum';
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
}
