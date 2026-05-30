// Supabase 服务端客户端（仅 API Routes 使用，浏览器不可访问）
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://udhdrktjhyzhmahnyhyu.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkaGRya3RqaHl6aG1haG5oeWh1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDEyNTY0NiwiZXhwIjoyMDk1NzAxNjQ2fQ.jTyQ9XE05_2ST7aWWvo_WoOOuLRvsRdfbXtH8ifjCi0";

export const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});
