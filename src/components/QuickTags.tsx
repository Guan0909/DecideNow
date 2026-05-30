"use client";

interface Tag {
  label: string;
  icon: string;
  template: string;
}

const TAGS: Tag[] = [
  { label: "午餐", icon: "🍜", template: "中午吃什么？一个人，30元以内" },
  { label: "约会", icon: "💕", template: "约会晚餐，人均150，浪漫安静" },
  { label: "团建", icon: "🎉", template: "团建聚餐，10个人，人均100，要能嗨" },
  { label: "咖啡", icon: "☕", template: "找个咖啡馆办公，安静有WiFi" },
  { label: "出游", icon: "🏕️", template: "周末去哪玩？户外，自驾，一日游" },
  { label: "电影", icon: "🎬", template: "最近有什么好看的电影？动作科幻" },
  { label: "健身", icon: "💪", template: "附近健身房推荐，预算月卡500以内" },
  { label: "甜品", icon: "🍰", template: "想吃甜品，颜值高，适合拍照" },
];

interface QuickTagsProps {
  onSelect: (template: string) => void;
}

export function QuickTags({ onSelect }: QuickTagsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {TAGS.map((tag) => (
        <button
          key={tag.label}
          onClick={() => onSelect(tag.template)}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary active:scale-95"
        >
          <span className="text-base">{tag.icon}</span>
          <span>{tag.label}</span>
        </button>
      ))}
    </div>
  );
}

export { TAGS };
