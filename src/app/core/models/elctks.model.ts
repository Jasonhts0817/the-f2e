import { ElectedMarkEnum } from '../enums/elected-mark.enum';
import { VoteYearEnum } from '../enums/vote-year.enum';

/** 候選人得票檔 */
export class Elctks {
  id?: number;
  year: VoteYearEnum;
  /**
   * 省市別
   *
   * 全國層級時，該省市別為00
   */
  provinceCity: string;
  /**
   * 縣市別
   *
   * 縣市以上層級彙總時，該縣市別為000
   */
  countyCity: string;
  /**
   * 選區別
   *
   * 選區以上層級彙總時，該選區為00
   */
  electoralDistrict: string;
  /**
   * 鄉鎮市區
   *
   * 鄉鎮市區以上層級彙總時，該鄉鎮市區別為000
   */
  townshipDistrict: string;
  /**
   * 村里別
   *
   * 村里以上層級彙總時，該村里別為0000
   */
  village: string;
  /**
   * 投開票所
   *
   * 投開票所以上層級彙總時，該投開票所別為0
   */
  pollingStation: string;
  /** 候選人號次 */
  candidateNumber: number;
  /** 得票數 */
  voteCount: number;
  /** 得票率 */
  votePercentage: number;
  /**
   * 當選註記
   *
   * *:當選，“ “:未當選，!:婦女保障 -:因婦女保障被排擠未當選
   */
  electedMark: ElectedMarkEnum;
  constructor(data: any, year: VoteYearEnum) {
    this.year = year;
    this.provinceCity = data[0].trim();
    this.countyCity = data[1].trim();
    this.electoralDistrict = data[2].trim();
    this.townshipDistrict = data[3].trim();
    this.village = data[4].trim();
    this.pollingStation = data[5].trim();
    this.candidateNumber = data[6].trim();
    this.voteCount = data[7].trim();
    this.votePercentage = data[8].trim();
    this.electedMark = data[9].trim();
  }
}
