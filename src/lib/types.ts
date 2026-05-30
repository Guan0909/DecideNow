// ============================================
// DecideNow - 核心类型定义
// ============================================

/** AI 解析后的约束条件 */
export interface Constraints {
  people: number | null;
  budget: number | null;
  location: string | null;
  taste: string | null;
  atmosphere: string | null;
  occasion: string | null;
  keywords: string[];
  rawInput: string;
}

/** 解析结果 */
export interface ParseResult {
  constraints: Constraints;
  missingFields: string[];
}

/** 单个选项的评分卡 */
export interface ScoreCard {
  taste: number;       // 1-5 星
  ambiance: number;    // 1-5 星
  budget: number;      // 1-5 星
}

/** AI 生成的决策选项 */
export interface DecisionOption {
  name: string;
  description: string;
  scoreCard: ScoreCard;
  priceHint: string;
  locationHint: string;
}

/** 生成选项的请求 */
export interface GenerateRequest {
  constraints: Constraints;
  count?: number;
}

/** 生成选项的响应 */
export interface GenerateResponse {
  options: DecisionOption[];
}

/** 决策模式 */
export type DecisionMode = "SINGLE" | "MULTI";

/** 决策状态 */
export type DecisionStatus = "PENDING" | "COMPLETED" | "EXPIRED";
