import Link from "next/link";
import { Layers3 } from "lucide-react";
import { cn } from "@/lib/utils";
export function Brand({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link
      className={cn("brand", className)}
      href="/"
      aria-label="HumanLayer home"
    >
      <span className="brand-mark">
        <Layers3 size={21} strokeWidth={1.65} />
      </span>
      {!compact && <span>HumanLayer</span>}
    </Link>
  );
}
