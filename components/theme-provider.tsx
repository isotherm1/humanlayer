"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { MotionConfig } from "motion/react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
const ThemeContext = createContext<{
  theme: "dark" | "light";
  toggle: () => void;
}>({ theme: "light", toggle: () => {} });
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"dark" | "light">("light");
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
      }}
    >
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </ThemeContext.Provider>
  );
}
export function ThemeToggle() {
  const { theme, toggle } = useContext(ThemeContext);
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={`切换为${theme === "dark" ? "浅色" : "深色"}模式`}
      title={`切换为${theme === "dark" ? "浅色" : "深色"}模式`}
    >
      {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
    </Button>
  );
}
