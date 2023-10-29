/** 行政區基本資料 */
export class Elbase {
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
  /** 名稱 */
  name: string;
  constructor(data: any) {
    this.provinceCity = data[0];
    this.countyCity = data[1];
    this.electoralDistrict = data[2];
    this.townshipDistrict = data[3];
    this.village = data[4];
    this.name = data[5];
  }
}
