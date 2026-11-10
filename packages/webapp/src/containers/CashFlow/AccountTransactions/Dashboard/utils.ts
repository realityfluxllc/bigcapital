export type BankFeedProvider = 'plaid' | 'simplefin';

export type BankFeedStatus = 'not_connected' | 'active' | 'paused';

/**
 * Subset of the bank account fields the summary tab reads for feed state.
 * (The generated `Account` type does not declare every runtime field yet.)
 */
export interface BankFeedAccountLike {
  plaidItemId?: string | null;
  simplefinItemId?: string | null;
  isFeedsActive?: boolean;
  isFeedsPaused?: boolean;
  amount?: number;
  bankBalance?: number;
}

/**
 * Determines which bank feed provider the account is linked to, if any.
 */
export const getBankFeedProvider = (
  account: BankFeedAccountLike | null | undefined,
): BankFeedProvider | null => {
  if (account?.plaidItemId) return 'plaid';
  if (account?.simplefinItemId) return 'simplefin';
  return null;
};

/**
 * Determines the bank feed status of the account.
 */
export const getBankFeedStatus = (
  account: BankFeedAccountLike | null | undefined,
): BankFeedStatus => {
  if (!account?.isFeedsActive) return 'not_connected';
  return account.isFeedsPaused ? 'paused' : 'active';
};

/**
 * Difference between the balance in Bigcapital and the balance reported by the
 * bank (positive when Bigcapital has more), or null when either is unknown.
 */
export const getBalanceDifference = (
  account: BankFeedAccountLike | null | undefined,
): number | null => {
  if (!account?.isFeedsActive) return null;
  const book = Number(account.amount);
  const bank = Number(account.bankBalance);

  if (!Number.isFinite(book) || !Number.isFinite(bank)) return null;
  // Avoid "-0.00" style noise from floating point arithmetic.
  return Math.round((book - bank) * 100) / 100;
};
