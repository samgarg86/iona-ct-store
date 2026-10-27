import type { Money } from "@/lib/types";

export function formatMoney(money: Money, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: money.currencyCode,
    minimumFractionDigits: money.fractionDigits,
    maximumFractionDigits: money.fractionDigits,
  }).format(money.centAmount / 10 ** money.fractionDigits);
}
