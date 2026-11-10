import {
  getBalanceDifference,
  getBankFeedProvider,
  getBankFeedStatus,
} from '../utils';

describe('Bank account summary tab utils', () => {
  describe('getBankFeedProvider', () => {
    it('detects Plaid and SimpleFIN links', () => {
      expect(getBankFeedProvider({ plaidItemId: 'item-1' })).toBe('plaid');
      expect(getBankFeedProvider({ simplefinItemId: 'abc' })).toBe('simplefin');
    });

    it('returns null for an unlinked account', () => {
      expect(getBankFeedProvider({})).toBeNull();
      expect(getBankFeedProvider(undefined)).toBeNull();
    });
  });

  describe('getBankFeedStatus', () => {
    it('reports the feed state', () => {
      expect(getBankFeedStatus({ isFeedsActive: false })).toBe('not_connected');
      expect(
        getBankFeedStatus({ isFeedsActive: true, isFeedsPaused: false }),
      ).toBe('active');
      expect(
        getBankFeedStatus({ isFeedsActive: true, isFeedsPaused: true }),
      ).toBe('paused');
      expect(getBankFeedStatus(null)).toBe('not_connected');
    });
  });

  describe('getBalanceDifference', () => {
    it('returns book minus bank balance for a connected account', () => {
      expect(
        getBalanceDifference({
          isFeedsActive: true,
          amount: 1250.1,
          bankBalance: 1000,
        }),
      ).toBe(250.1);
      expect(
        getBalanceDifference({
          isFeedsActive: true,
          amount: 0.1 + 0.2,
          bankBalance: 0.3,
        }),
      ).toBe(0);
    });

    it('returns null when not connected or balances are unknown', () => {
      expect(
        getBalanceDifference({
          isFeedsActive: false,
          amount: 10,
          bankBalance: 5,
        }),
      ).toBeNull();
      expect(
        getBalanceDifference({ isFeedsActive: true, amount: 10 }),
      ).toBeNull();
      expect(getBalanceDifference(undefined)).toBeNull();
    });
  });
});
