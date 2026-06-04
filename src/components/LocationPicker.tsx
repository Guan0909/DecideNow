"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";

interface Suggestion {
  name: string;
  district: string;
  adcode: string;
  location: string; // "lng,lat"
}

interface LocationPickerProps {
  value: string | null;
  onChange: (display: string, detail: string | null, coords: { lat: number; lng: number } | null) => void;
}

const HOT_CITIES = ["上海","北京","深圳","广州","杭州","成都","重庆","武汉","南京"];

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // 防抖搜索
  function handleInput(v: string) {
    setInput(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (v.trim().length < 1) { setSuggestions([]); return; }
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const key = "4687666a6b6d68df9ba83c006e29c68f";
        const res = await fetch(`https://restapi.amap.com/v3/assistant/inputtips?key=${key}&keywords=${encodeURIComponent(v)}&output=JSON`);
        if (res.ok) {
          const data = await res.json();
          if (data.tips) setSuggestions(data.tips.filter((t: { location: string }) => t.location && t.location !== "[]"));
        }
      } catch {} finally { setLoading(false); }
    }, 300);
  }

  function handleSelect(s: Suggestion) {
    const [lng, lat] = s.location.split(",").map(Number);
    onChange(s.name, s.district || s.name, { lat, lng });
    setInput("");
    setSuggestions([]);
    setOpen(false);
  }

  function handleCitySelect(city: string) {
    onChange(city, null, null);
    setOpen(false);
  }

  async function handleLocate() {
    if (!navigator.geolocation) { onChange("上海", null, null); setOpen(false); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      try {
        const key = "4687666a6b6d68df9ba83c006e29c68f";
        const res = await fetch(`https://restapi.amap.com/v3/geocode/regeo?key=${key}&location=${lng},${lat}&extensions=base&output=JSON`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "1" && data.regeocode?.addressComponent) {
            const ac = data.regeocode.addressComponent;
            const addr = ac.building?.name || ac.streetNumber?.street || "";
            const district = ac.district || "";
            const name = addr ? `${district}·${addr}` : (ac.township || district || "已定位");
            onChange(name, data.regeocode.formatted_address || name, { lat, lng });
          } else {
            onChange(`${lat.toFixed(4)},${lng.toFixed(4)}`, null, { lat, lng });
          }
        }
      } catch { onChange(`${lat.toFixed(4)},${lng.toFixed(4)}`, null, { lat, lng }); }
      setLocating(false);
      setOpen(false);
    }, () => { onChange("上海", null, null); setLocating(false); setOpen(false); }, { timeout: 6000, enableHighAccuracy: true });
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-sm font-semibold text-foreground hover:text-primary transition-colors"
      >
        <MapPin className="h-4 w-4 text-primary" />
        <span className="max-w-[100px] truncate">{value || "选择位置"}</span>
        <svg className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 12 12" fill="currentColor"><path d="M3 5l3 3 3-3"/></svg>
      </button>

      {open && (
        <div className="absolute left-0 top-8 z-50 w-72 animate-in rounded-2xl bg-card border border-border shadow-xl p-3">
          {/* 搜索框 */}
          <div className="relative mb-2">
            <input
              value={input}
              onChange={(e) => handleInput(e.target.value)}
              placeholder="搜索地址..."
              className="input-premium w-full py-2 pl-8 pr-3 text-xs"
              autoFocus
            />
            <MapPin className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/40" />
            {loading && <Loader2 className="absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 animate-spin text-muted-foreground" />}
          </div>

          {/* 下拉建议 */}
          {suggestions.length > 0 && (
            <div className="mb-2 max-h-48 overflow-y-auto rounded-xl border border-border/50">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(s)}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs hover:bg-muted transition-colors"
                >
                  <MapPin className="h-3 w-3 shrink-0 text-muted-foreground/50" />
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{s.name}</p>
                    {s.district && <p className="text-[10px] text-muted-foreground truncate">{s.district}</p>}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* GPS 定位 */}
          <button onClick={handleLocate} disabled={locating}
            className="flex w-full items-center gap-2 rounded-xl bg-muted/50 px-3 py-2.5 text-sm font-medium text-foreground/70 hover:bg-muted transition-colors mb-2"
          >
            {locating ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Navigation className="h-4 w-4 text-primary" />}
            {locating ? "定位中..." : "📍 使用当前位置"}
          </button>

          {/* 热门城市 */}
          <p className="mb-1.5 text-[10px] font-medium text-muted-foreground/50">热门城市</p>
          <div className="grid grid-cols-3 gap-1.5">
            {HOT_CITIES.map((city) => (
              <button key={city} onClick={() => handleCitySelect(city)}
                className={`rounded-lg py-2 text-xs font-medium transition-colors ${value === city ? "bg-primary/10 text-primary" : "text-foreground/60 hover:bg-muted"}`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
