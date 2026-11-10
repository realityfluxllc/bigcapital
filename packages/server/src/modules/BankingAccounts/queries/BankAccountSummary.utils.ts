import * as moment from 'moment';
import { formatNumber } from '@/utils/format-number';

/**
 * Raw debit/credit aggregation of GL entries for one bank account.
 */
export interface BankAccountActivityTotals {
  debit: number | string | null;
  credit: number | string | null;
  count: number | string | null;
}

/**
 * Money in/out summary of a bank account for a date window.
 */
export interface BankAccountActivitySummary {
  fromDate: string;
  toDate: string;
  moneyIn: number;
  moneyOut: number;
  net: number;
  transactionsCount: number;
  moneyInFormatted: string;
  moneyOutFormatted: string;
  netFormatted: string;
}

const toNumber = (value: number | string | null | undefined): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

/**
 * Returns the inclusive date window (YYYY-MM-DD) of the last N days ending today.
 */
export const getLastDaysWindow = (
  days: number,
  today: moment.MomentInput = undefined,
): { fromDate: string; toDate: string } => {
  const end = moment(today).endOf('day');
  const start = end
    .clone()
    .subtract(Math.max(days - 1, 0), 'days')
    .startOf('day');

  return {
    fromDate: start.format('YYYY-MM-DD'),
    toDate: end.format('YYYY-MM-DD'),
  };
};

/**
 * Summarizes the GL debit/credit totals of a bank account as money in/out.
 *
 * Debits on a bank or credit-card account are money flowing into it
 * (deposits, card payments) and credits are money flowing out of it
 * (withdrawals, charges), regardless of the account's normal balance.
 */
export const summarizeBankAccountActivity = (
  totals: BankAccountActivityTotals | null | undefined,
  window: { fromDate: string; toDate: string },
  currencyCode: string,
): BankAccountActivitySummary => {
  const moneyIn = toNumber(totals?.debit);
  const moneyOut = toNumber(totals?.credit);
  const net = moneyIn - moneyOut;
  // Same formatting as the account's `formattedAmount` / `bankBalanceFormatted`.
  const format = (value: number) =>
    formatNumber(value, { money: false, currencyCode });

  return {
    ...window,
    moneyIn,
    moneyOut,
    net,
    transactionsCount: toNumber(totals?.count),
    moneyInFormatted: format(moneyIn),
    moneyOutFormatted: format(moneyOut),
    netFormatted: format(net),
  };
};
