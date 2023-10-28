/**
 * 不分區政黨得票檔
 *
 * 只有不分區及僑居國外國民立委選舉才需要
 */
export class Elretks {
  /** 政黨代號 */
  politicalPartyCode: string | undefined = undefined;
  /** 第一階段得票率 */
  firstStageVotePercentage: number | undefined = undefined;
  /** 第二階段得票率 */
  secondStageVotePercentage: number | undefined = undefined;
  /** 候選人數 */
  candidates: number | undefined = undefined;
  /** 當選人數 */
  electeds: number | undefined = undefined;
}
