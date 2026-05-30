-- ============================================
-- DecideNow - Supabase 数据库建表 SQL
-- 在 Supabase SQL Editor 中执行此文件
-- ============================================

-- 枚举类型
CREATE TYPE "DecisionMode" AS ENUM ('SINGLE', 'MULTI');
CREATE TYPE "DecisionStatus" AS ENUM ('PENDING', 'COMPLETED', 'EXPIRED');

-- 用户表
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT UNIQUE,
    "name" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 决策表
CREATE TABLE "Decision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "mode" "DecisionMode" NOT NULL DEFAULT 'SINGLE',
    "status" "DecisionStatus" NOT NULL DEFAULT 'PENDING',
    "selectedId" TEXT,
    "constraints" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "ownerId" TEXT,
    CONSTRAINT "Decision_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- 选项表
CREATE TABLE "Option" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "decisionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "priceHint" TEXT,
    "locationHint" TEXT,
    "scoreCard" JSONB,
    "imageUrl" TEXT,
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Option_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "Decision"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 投票表
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "optionId" TEXT NOT NULL,
    "userId" TEXT,
    "reason" TEXT,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Vote_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "Option"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- 多人投票房间表
CREATE TABLE "Room" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shareCode" TEXT NOT NULL UNIQUE,
    "decisionId" TEXT NOT NULL UNIQUE,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "deadline" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Room_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "Decision"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 索引
CREATE INDEX "Decision_ownerId_idx" ON "Decision"("ownerId");
CREATE INDEX "Option_decisionId_idx" ON "Option"("decisionId");
CREATE INDEX "Vote_optionId_idx" ON "Vote"("optionId");
CREATE INDEX "Room_shareCode_idx" ON "Room"("shareCode");
