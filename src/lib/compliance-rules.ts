import type { ComplianceRule } from './types'

export const COMPLIANCE_RULES: ComplianceRule[] = [
  {
    id: 'guaranteed-returns',
    name: 'Guaranteeing non-guaranteed returns',
    description:
      'The planner promises or implies guaranteed returns on non-guaranteed products. Look for phrases like "保證回報", "一定會有", "肯定有回報", or any statement that guarantees returns on products that have non-guaranteed components (e.g., dividends, bonuses). This includes using words like "guaranteed", "certain", "definitely" when referring to projected/illustrated returns.',
    severity: 'violation',
    message: {
      en: 'Guaranteed non-guaranteed returns — promising returns that are not guaranteed by the product',
      zh: '保證非保證回報 — 承諾產品不保證的回報',
    },
  },
  {
    id: 'misrepresentation',
    name: 'Product misrepresentation',
    description:
      'The planner makes false or misleading claims about product coverage, features, terms, or conditions. This includes overstating coverage, understating exclusions, providing incorrect premium information, or misrepresenting comparison with competitors.',
    severity: 'violation',
    message: {
      en: 'Product misrepresentation — false or misleading claims about product features',
      zh: '產品失實陳述 — 對產品特徵作出虛假或誤導性聲明',
    },
  },
  {
    id: 'pressure-selling',
    name: 'Pressure selling tactics',
    description:
      'The planner uses urgency, scarcity, or time pressure to push a sale. Look for phrases like "limited time offer", "price going up", "last chance", "offer expires", "名額有限", "限時優惠", "即將加價", or any statement creating artificial urgency to force a purchase decision.',
    severity: 'warning',
    message: {
      en: 'Pressure selling — using urgency or scarcity tactics to push a sale',
      zh: '施壓式銷售 — 使用緊迫性或稀缺性策略推動銷售',
    },
  },
  {
    id: 'missing-risk',
    name: 'Missing risk disclosure',
    description:
      'The planner discusses investment-linked products (ILAS/投連險, funds, investment components) without adequate risk disclosure. When presenting any product with investment risk, the planner must mention that the value can go down as well as up, and that past performance does not guarantee future results.',
    severity: 'warning',
    message: {
      en: 'Missing risk disclosure — failed to disclose investment risks adequately',
      zh: '遺漏風險披露 — 未充分披露投資風險',
    },
  },
  {
    id: 'unlicensed-advice',
    name: 'Specific investment advice',
    description:
      'The planner gives specific investment recommendations beyond their license scope as an insurance intermediary. This includes recommending specific stocks, funds by name for investment purposes, market timing advice, or portfolio allocation advice that goes beyond describing insurance product features.',
    severity: 'warning',
    message: {
      en: 'Unlicensed investment advice — giving specific investment recommendations beyond license scope',
      zh: '無牌投資建議 — 超出牌照範圍提供具體投資建議',
    },
  },
]
