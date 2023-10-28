/** 政黨基本資料 */
export class Elpaty {
  /** 政黨代號 */
  politicalPartyCode: number | undefined = undefined;
  /** 政黨名稱 */
  politicalPartyName: string | undefined = undefined;
  constructor(data: any) {
    this.politicalPartyCode = data[0];
    this.politicalPartyName = data[1];
  }
}
