/** 選舉概況 */
export class Elprof {
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
  /** 有效票 */
  validVotes: number | undefined = undefined;
  /** 無效票 */
  invalidVotes: number | undefined = undefined;
  /** 投票數 */
  totalVotes: number | undefined = undefined;
  /** 選舉人數 */
  electorate: number | undefined = undefined;
  /** 人口數補選時僅有第1筆全選區有資料 */
  population: number | undefined = undefined;
  /** 候選人數合計 */
  totalCandidates: number | undefined = undefined;
  /** 當選人數合計 */
  totalElected: number | undefined = undefined;
  /** 候選人數-男 */
  maleCandidates: number | undefined = undefined;
  /** 候選人數-女 */
  femaleCandidates: number | undefined = undefined;
  /** 當選人數-男 */
  maleElected: number | undefined = undefined;
  /** 當選人數-女 */
  femaleElected: number | undefined = undefined;
  /** 選舉人數對人口數  全國性選舉僅縣市層級列有資料 補選時僅第1筆全選區有資料 */
  electorateToPopulationRatio: number | undefined = undefined;
  /** 投票數對選舉人數 */
  voterTurnout: number | undefined = undefined;
  /** 當選人數對候選人數 */
  electedToCandidateRatio: number | undefined = undefined;
  constructor(data: any) {
    this.provinceCity = data[0];
    this.countyCity = data[1];
    this.electoralDistrict = data[2];
    this.townshipDistrict = data[3];
    this.village = data[4];
    this.pollingStation = data[5];
    this.validVotes = data[6];
    this.invalidVotes = data[7];
    this.totalVotes = data[8];
    this.electorate = data[9];
    this.population = data[10];
    this.totalCandidates = data[11];
    this.totalElected = data[12];
    this.maleCandidates = data[13];
    this.femaleCandidates = data[14];
    this.maleElected = data[15];
    this.femaleElected = data[16];
    this.electorateToPopulationRatio = data[17];
    this.voterTurnout = data[18];
    this.electedToCandidateRatio = data[19];
  }
}
