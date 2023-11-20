import { VoteYearEnum } from '../enums/vote-year.enum';

/** 政黨基本資料 */
export class Elpaty {
  id?: number;
  year: VoteYearEnum;
  /** 政黨代號 */
  politicalPartyCode: number;
  /** 政黨名稱 */
  politicalPartyName: string;
  constructor(data: any, year: VoteYearEnum) {
    this.year = year;
    this.politicalPartyCode = data[0];
    this.politicalPartyName = data[1];
  }
}
