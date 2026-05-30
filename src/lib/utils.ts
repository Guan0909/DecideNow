import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 生成 6 位随机分享码（大写字母+数字） */
export function generateShareCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 去掉容易混淆的 0/O/1/I
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/** 格式化截止时间 */
export function formatDeadline(date: Date | null): string {
  if (!date) return "无截止时间";
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  if (diff <= 0) return "已截止";
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `剩余 ${hours} 小时 ${mins} 分钟`;
  return `剩余 ${mins} 分钟`;
}
