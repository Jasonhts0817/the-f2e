import { ElectedMarkEnum } from 'src/app/core/enums/elected-mark.enum';
import { VoteYearEnum } from 'src/app/core/enums/vote-year.enum';
import { Elbase } from 'src/app/core/models/elbase.model';

export interface RegionFilterVM {
  year?: VoteYearEnum;
  provinceAnyCountyCity?: Elbase;
  townshipDistrict?: Elbase;
  village?: Elbase;
}

export interface CandidateInfoVM {
  /** 政黨名稱 */
  politicalPartyName: string;
  /** 候選人名稱 */
  name: string;
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
}

export interface VoteInfoVM {
  /** 投票數對選舉人數 */
  voterTurnout: number;
  /** 有效票 */
  validVotes: number;
  /** 無效票 */
  invalidVotes: number;
  /** 投票數 */
  totalVotes: number;
}

export interface AreaVoteInfoVM {
  /** 區域名稱 */
  areaName: string;

  partyVoteInfo: {
    /** 政黨名稱 */
    politicalPartyName: string;
    /** 得票率 */
    votePercentage: number;
  };
  /** 當選人名稱 */
  electedName: string;
  /** 投票數 */
  totalVotes: number;
  /** 投票數對選舉人數 */
  voterTurnout: number;
}
