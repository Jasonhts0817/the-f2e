/** 政黨基本資料 */
export class Elpaty {
  /** 政黨代號 */
  politicalPartyCode: number;
  /** 政黨名稱 */
  politicalPartyName: string;
  constructor(data: any) {
    this.politicalPartyCode = data[0];
    this.politicalPartyName = data[1];
  }
}
