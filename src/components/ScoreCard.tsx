import { Star } from "lucide-react";

interface ScoreCardProps {
  scoreCard: {
    taste: number;
    ambiance: number;
    budget: number;
  };
}

const LABELS: Record<keyof ScoreCardProps["scoreCard"], string> = {
  taste: "口味",
  ambiance: "氛围",
  budget: "预算",
};

export function ScoreCard({ scoreCard }: ScoreCardProps) {
  return (
    <div className="flex gap-4">
      {(Object.entries(scoreCard) as [keyof typeof LABELS, number][]).map(
        ([key, value]) => (
          <div key={key} className="flex flex-col items-center gap-1">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {LABELS[key]}
            </span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3.5 w-3.5 ${
                    star <= value
                      ? "fill-amber-400 text-amber-400"
                      : "fill-none text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
