// ============================================
// Supabase 数据库类型定义
// 后期可通过 `supabase gen types` 自动生成
// ============================================

export interface Database {
  public: {
    Tables: {
      User: {
        Row: {
          id: string;
          email: string | null;
          name: string | null;
          avatarUrl: string | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          email?: string | null;
          name?: string | null;
          avatarUrl?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          name?: string | null;
          avatarUrl?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
      };
      Decision: {
        Row: {
          id: string;
          title: string;
          mode: string;
          status: string;
          selectedId: string | null;
          constraints: string | null;
          createdAt: string;
          completedAt: string | null;
          ownerId: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          mode?: string;
          status?: string;
          selectedId?: string | null;
          constraints?: string | null;
          createdAt?: string;
          completedAt?: string | null;
          ownerId?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          mode?: string;
          status?: string;
          selectedId?: string | null;
          constraints?: string | null;
          createdAt?: string;
          completedAt?: string | null;
          ownerId?: string | null;
        };
      };
      Option: {
        Row: {
          id: string;
          decisionId: string;
          name: string;
          description: string;
          priceHint: string | null;
          locationHint: string | null;
          scoreCard: string | null;
          imageUrl: string | null;
          voteCount: number;
          sortOrder: number;
        };
        Insert: {
          id?: string;
          decisionId: string;
          name: string;
          description: string;
          priceHint?: string | null;
          locationHint?: string | null;
          scoreCard?: string | null;
          imageUrl?: string | null;
          voteCount?: number;
          sortOrder?: number;
        };
        Update: {
          id?: string;
          decisionId?: string;
          name?: string;
          description?: string;
          priceHint?: string | null;
          locationHint?: string | null;
          scoreCard?: string | null;
          imageUrl?: string | null;
          voteCount?: number;
          sortOrder?: number;
        };
      };
      Vote: {
        Row: {
          id: string;
          optionId: string;
          userId: string | null;
          reason: string | null;
          isAnonymous: boolean;
          createdAt: string;
        };
        Insert: {
          id?: string;
          optionId: string;
          userId?: string | null;
          reason?: string | null;
          isAnonymous?: boolean;
          createdAt?: string;
        };
        Update: {
          id?: string;
          optionId?: string;
          userId?: string | null;
          reason?: string | null;
          isAnonymous?: boolean;
          createdAt?: string;
        };
      };
      Room: {
        Row: {
          id: string;
          shareCode: string;
          decisionId: string;
          isAnonymous: boolean;
          deadline: string | null;
          closedAt: string | null;
          createdAt: string;
        };
        Insert: {
          id?: string;
          shareCode: string;
          decisionId: string;
          isAnonymous?: boolean;
          deadline?: string | null;
          closedAt?: string | null;
          createdAt?: string;
        };
        Update: {
          id?: string;
          shareCode?: string;
          decisionId?: string;
          isAnonymous?: boolean;
          deadline?: string | null;
          closedAt?: string | null;
          createdAt?: string;
        };
      };
    };
  };
}
