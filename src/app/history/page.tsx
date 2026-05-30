"use client";

import { useEffect, useState } from "react";
import { HistoryList } from "@/components/HistoryList";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function HistoryPage() {
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/decisions");
        if (res.ok) {
          const data = await res.json();
          setDecisions(data);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="mx-auto max-w-lg px-5 py-8 safe-top safe-bottom">
      {/* 头部 */}
      <div className="mb-6 flex items-center gap-3">
        <Link href="/" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">我的决定库</h1>
        <span className="ml-auto text-sm text-muted-foreground">
          {decisions.length} 条记录
        </span>
      </div>

      {/* 列表 */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <HistoryList decisions={decisions} />
      )}
    </div>
  );
}
