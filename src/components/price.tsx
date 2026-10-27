import { formatMoney } from "@/lib/format";
import type { Price as PriceType } from "@/lib/types";

interface PriceProps {
  price?: PriceType;
  locale: string;
  className?: string;
}

export function Price({ price, locale, className }: PriceProps) {
  if (!price) {
    return <p className={`text-muted ${className ?? ""}`}>Price unavailable</p>;
  }

  if (price.discounted) {
    return (
      <p className={`flex items-baseline gap-2 ${className ?? ""}`}>
        <span className="font-medium text-accent">{formatMoney(price.discounted, locale)}</span>
        <s className="text-sm text-muted">{formatMoney(price.value, locale)}</s>
      </p>
    );
  }

  return <p className={`font-medium ${className ?? ""}`}>{formatMoney(price.value, locale)}</p>;
}
