/** 行政區基本資料 */
export class Elbase {
  /**
   * 省市別
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
  /** 名稱 */
  name: string | undefined = undefined;
  constructor(data: any) {
    this.provinceCity = data[0];
    this.countyCity = data[1];
    this.electoralDistrict = data[2];
    this.townshipDistrict = data[3];
    this.village = data[4];
    this.name = data[5];
  }
}
