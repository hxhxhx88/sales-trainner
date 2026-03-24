interface KeywordBoost {
  keyword: string
  boost: number
  category: string
}

export const HK_INSURANCE_VOCAB: KeywordBoost[] = [
  // Product Types (boost: 3-5)
  { keyword: '储蓄保险', boost: 4, category: 'product' },
  { keyword: '危疾保险', boost: 4, category: 'product' },
  { keyword: '人寿保险', boost: 4, category: 'product' },
  { keyword: '医疗保险', boost: 4, category: 'product' },
  { keyword: '投连险', boost: 5, category: 'product' },
  { keyword: '万用寿险', boost: 4, category: 'product' },
  { keyword: '自愿医保', boost: 5, category: 'product' },
  { keyword: 'VHIS', boost: 5, category: 'product' },
  { keyword: '年金', boost: 4, category: 'product' },
  { keyword: '定期寿险', boost: 4, category: 'product' },
  { keyword: '终身寿险', boost: 4, category: 'product' },
  { keyword: '重疾险', boost: 4, category: 'product' },
  { keyword: '意外保险', boost: 3, category: 'product' },
  { keyword: '教育基金', boost: 3, category: 'product' },
  { keyword: '退休计划', boost: 3, category: 'product' },
  { keyword: '储蓄分红', boost: 4, category: 'product' },
  { keyword: '投资相连', boost: 5, category: 'product' },
  { keyword: '延期年金', boost: 4, category: 'product' },
  { keyword: '即期年金', boost: 4, category: 'product' },
  { keyword: '高端医疗', boost: 3, category: 'product' },

  // Company Names (boost: 5)
  { keyword: '友邦', boost: 5, category: 'company' },
  { keyword: 'AIA', boost: 5, category: 'company' },
  { keyword: '保诚', boost: 5, category: 'company' },
  { keyword: 'Prudential', boost: 5, category: 'company' },
  { keyword: '宏利', boost: 5, category: 'company' },
  { keyword: 'Manulife', boost: 5, category: 'company' },
  { keyword: '富卫', boost: 5, category: 'company' },
  { keyword: 'FWD', boost: 5, category: 'company' },
  { keyword: '安盛', boost: 5, category: 'company' },
  { keyword: 'AXA', boost: 5, category: 'company' },
  { keyword: '中银人寿', boost: 5, category: 'company' },
  { keyword: '恒生保险', boost: 5, category: 'company' },
  { keyword: '永明', boost: 5, category: 'company' },
  { keyword: '中国人寿', boost: 5, category: 'company' },
  { keyword: '太平', boost: 5, category: 'company' },

  // Regulatory Terms (boost: 4)
  { keyword: '保监局', boost: 4, category: 'regulatory' },
  { keyword: 'IIQE', boost: 5, category: 'regulatory' },
  { keyword: '持续专业发展', boost: 4, category: 'regulatory' },
  { keyword: 'CPD', boost: 4, category: 'regulatory' },
  { keyword: '合规', boost: 4, category: 'regulatory' },
  { keyword: '适合性', boost: 4, category: 'regulatory' },
  { keyword: '冷静期', boost: 5, category: 'regulatory' },
  { keyword: '重要事实声明', boost: 4, category: 'regulatory' },
  { keyword: '财务需要分析', boost: 4, category: 'regulatory' },
  { keyword: '保险中介人', boost: 4, category: 'regulatory' },
  { keyword: '持牌', boost: 3, category: 'regulatory' },
  { keyword: '投诉', boost: 3, category: 'regulatory' },
  { keyword: '索偿', boost: 4, category: 'regulatory' },
  { keyword: '保障缺口', boost: 4, category: 'regulatory' },

  // Financial Terms (boost: 3-4)
  { keyword: '保费', boost: 4, category: 'financial' },
  { keyword: '保额', boost: 4, category: 'financial' },
  { keyword: '退保价值', boost: 5, category: 'financial' },
  { keyword: '供款期', boost: 4, category: 'financial' },
  { keyword: '红利', boost: 4, category: 'financial' },
  { keyword: '保证回报', boost: 5, category: 'financial' },
  { keyword: '非保证', boost: 5, category: 'financial' },
  { keyword: '回报率', boost: 4, category: 'financial' },
  { keyword: '核保', boost: 4, category: 'financial' },
  { keyword: '受保人', boost: 3, category: 'financial' },
  { keyword: '保单持有人', boost: 3, category: 'financial' },
  { keyword: '受益人', boost: 3, category: 'financial' },
  { keyword: '免赔额', boost: 3, category: 'financial' },
  { keyword: '等候期', boost: 3, category: 'financial' },
  { keyword: '保单年期', boost: 3, category: 'financial' },
  { keyword: '现金价值', boost: 4, category: 'financial' },
  { keyword: '身故赔偿', boost: 4, category: 'financial' },
  { keyword: '危疾赔偿', boost: 4, category: 'financial' },
  { keyword: '住院赔偿', boost: 3, category: 'financial' },
  { keyword: '保证利率', boost: 5, category: 'financial' },
  { keyword: '预期回报', boost: 4, category: 'financial' },
  { keyword: '内部回报率', boost: 4, category: 'financial' },
  { keyword: 'IRR', boost: 4, category: 'financial' },
  { keyword: '杠杆', boost: 3, category: 'financial' },
  { keyword: '保单贷款', boost: 3, category: 'financial' },
  { keyword: '通胀', boost: 3, category: 'financial' },
  { keyword: '美元保单', boost: 4, category: 'financial' },
  { keyword: '港币保单', boost: 4, category: 'financial' },
  { keyword: '人民币保单', boost: 4, category: 'financial' },
  { keyword: '多元货币', boost: 4, category: 'financial' },

  // Medical/Health Terms (boost: 3-4)
  { keyword: '危疾', boost: 4, category: 'medical' },
  { keyword: '癌症', boost: 3, category: 'medical' },
  { keyword: '心脏病', boost: 3, category: 'medical' },
  { keyword: '中风', boost: 3, category: 'medical' },
  { keyword: '住院', boost: 3, category: 'medical' },
  { keyword: '手术', boost: 3, category: 'medical' },
  { keyword: '门诊', boost: 3, category: 'medical' },
  { keyword: '已有疾病', boost: 4, category: 'medical' },
  { keyword: '健康申报', boost: 4, category: 'medical' },
  { keyword: '体检', boost: 3, category: 'medical' },

  // Comparison Platforms (boost: 5)
  { keyword: '10Life', boost: 5, category: 'platform' },
  { keyword: 'GoBear', boost: 5, category: 'platform' },
  { keyword: '消委会', boost: 4, category: 'platform' },

  // Cross-border Terms (boost: 4)
  { keyword: 'QDII', boost: 5, category: 'cross-border' },
  { keyword: '跨境', boost: 4, category: 'cross-border' },
  { keyword: '内地', boost: 3, category: 'cross-border' },
  { keyword: '深圳', boost: 3, category: 'cross-border' },
  { keyword: '大湾区', boost: 4, category: 'cross-border' },
  { keyword: '外汇管制', boost: 4, category: 'cross-border' },
  { keyword: '资产配置', boost: 3, category: 'cross-border' },

  // Investment Terms (for Kevin persona) (boost: 3-4)
  { keyword: 'VOO', boost: 4, category: 'investment' },
  { keyword: 'ETF', boost: 3, category: 'investment' },
  { keyword: 'Endowus', boost: 5, category: 'investment' },
  { keyword: 'StashAway', boost: 5, category: 'investment' },
  { keyword: '机会成本', boost: 3, category: 'investment' },
  { keyword: '年化回报', boost: 4, category: 'investment' },
  { keyword: '复利', boost: 3, category: 'investment' },
  { keyword: '资产配置', boost: 3, category: 'investment' },
  { keyword: '被动投资', boost: 3, category: 'investment' },
  { keyword: '主动管理', boost: 3, category: 'investment' },

  // Sales/Objection Terms (boost: 3)
  { keyword: '太贵了', boost: 3, category: 'objection' },
  { keyword: '考虑一下', boost: 3, category: 'objection' },
  { keyword: '回去商量', boost: 3, category: 'objection' },
  { keyword: '不需要', boost: 3, category: 'objection' },
  { keyword: '没兴趣', boost: 3, category: 'objection' },
  { keyword: '不急', boost: 3, category: 'objection' },
  { keyword: '再看看', boost: 3, category: 'objection' },

  // Closing Terms (boost: 3)
  { keyword: '签单', boost: 4, category: 'closing' },
  { keyword: '投保', boost: 4, category: 'closing' },
  { keyword: '申请', boost: 3, category: 'closing' },
  { keyword: '方案', boost: 3, category: 'closing' },
  { keyword: '建议书', boost: 4, category: 'closing' },
  { keyword: '保单', boost: 4, category: 'closing' },
]

/**
 * Build Deepgram keyword parameters for WebSocket URL.
 * Returns a subset of keywords to avoid URL length limits.
 * Top 80 keywords by boost value are used.
 */
export function buildDeepgramKeywordParams(): string {
  const topKeywords = [...HK_INSURANCE_VOCAB]
    .sort((a, b) => b.boost - a.boost)
    .slice(0, 80)

  return topKeywords
    .map(({ keyword, boost }) => `keywords=${encodeURIComponent(keyword)}:${boost}`)
    .join('&')
}
