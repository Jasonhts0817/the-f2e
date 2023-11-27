import { VoteYearEnum } from '../enums/vote-year.enum';

/** 政黨得票檔 */
export class Elpinf {
  id?: number;
  year: VoteYearEnum;
  /**
   * 省市別
   *
   * 全國層級時，該省市別為00
   */
  provinceCity: string;
  /** 縣市別 */
  countyCity: string;
  /**
   * 選區別
   *
   * 使用範圍：立委、議員、里長、民代
   **/
  electoralDistrict: string;
  /** 鄉鎮市區 */
  townshipDistrict: string;
  /** 村里別 */
  village: string;
  /**
   * 投開票所
   *
   * 投開票所以上層級彙總時，該投開票所別為0
   */
  pollingStation: string;
  /** 政黨名稱 */
  politicalPartyName: string;
  /** 得票率 */
  votePercentage: number;
  /** 得票數 */
  voteCount: number;

  constructor(data: any, year: VoteYearEnum) {
    this.year = year;
    this.provinceCity = data[0].trim();
    this.countyCity = data[1].trim();
    this.electoralDistrict = data[2].trim();
    this.townshipDistrict = data[3].trim();
    this.village = data[4].trim();
    this.pollingStation = data[5].trim();
    this.politicalPartyName = data[6].trim();
    this.votePercentage = data[7].trim();
    this.voteCount = data[8].trim();
  }
}
