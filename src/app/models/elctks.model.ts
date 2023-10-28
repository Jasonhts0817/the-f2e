import { ElectedMarkEnum } from '../enums/electedMark.enum';

/** 候選人得票檔 */
export class Elctks {
  /**
   * 省市別
   *
   * 全國層級時，該省市別為00
   */
  provinceCity: string | undefined = undefined;
  /**
   * 縣市別
   *
   * 縣市以上層級彙總時，該縣市別為000
   */
  countyCity: string | undefined = undefined;
  /**
   * 選區別
   *
   * 選區以上層級彙總時，該選區為00
   */
  electoralDistrict: string | undefined = undefined;
  /**
   * 鄉鎮市區
   *
   * 鄉鎮市區以上層級彙總時，該鄉鎮市區別為000
   */
  townshipDistrict: string | undefined = undefined;
  /**
   * 村里別
   *
   * 村里以上層級彙總時，該村里別為0000
   */
  village: string | undefined = undefined;
  /**
   * 投開票所
   *
   * 投開票所以上層級彙總時，該投開票所別為0
   */
  pollingStation: number | undefined = undefined;
  /** 候選人號次 */
  candidateNumber: number | undefined = undefined;
  /** 得票數 */
  voteCount: number | undefined = undefined;
  /** 得票率 */
  votePercentage: number | undefined = undefined;
  /**
   * 當選註記
   *
   * *:當選，“ “:未當選，!:婦女保障 -:因婦女保障被排擠未當選
   */
  electedMark: ElectedMarkEnum | undefined = undefined;
  constructor(data: any) {
    this.provinceCity = data[0];
    this.countyCity = data[1];
    this.electoralDistrict = data[2];
    this.townshipDistrict = data[3];
    this.village = data[4];
    this.pollingStation = data[5];
    this.candidateNumber = data[6];
    this.voteCount = data[7];
    this.votePercentage = data[8];
    this.electedMark = data[9];
  }
}
