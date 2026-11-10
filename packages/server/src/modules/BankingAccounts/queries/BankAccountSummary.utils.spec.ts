import {
  getLastDaysWindow,
  summarizeBankAccountActivity,
} from './BankAccountSummary.utils';

describe('BankAccountSummary utils', () => {
  describe('getLastDaysWindow', () => {
    it('returns an inclusive window of N days ending today', () => {
      expect(getLastDaysWindow(30, '2026-11-10')).toEqual({
        fromDate: '2026-10-12',
        toDate: '2026-11-10',
      });
    });

    it('treats 1 (or less) as today only', () => {
      expect(getLastDaysWindow(1, '2026-11-10')).toEqual({
        fromDate: '2026-11-10',
        toDate: '2026-11-10',
      });
      expect(getLastDaysWindow(0, '2026-11-10').fromDate).toBe('2026-11-10');
    });
  });

  describe('summarizeBankAccountActivity', () => {
    const window = { fromDate: '2026-10-12', toDate: '2026-11-10' };

    it('maps debit to money in and credit to money out', () => {
      const summary = summarizeBankAccountActivity(
        { debit: '1500.5', credit: 420, count: '7' },
        window,
        'USD',
      );
      expect(summary).toMatchObject({
        ...window,
        moneyIn: 1500.5,
        moneyOut: 420,
        net: 1080.5,
        transactionsCount: 7,
        moneyInFormatted: '1,500.50',
        moneyOutFormatted: '420.00',
        netFormatted: '1,080.50',
      });
    });

    it('formats a negative net amount', () => {
      const summary = summarizeBankAccountActivity(
        { debit: 100, credit: 250, count: 2 },
        window,
        'USD',
      );
      expect(summary.net).toBe(-150);
      expect(summary.netFormatted).toBe('-150.00');
    });

    it('returns zeros when there is no activity', () => {
      expect(summarizeBankAccountActivity(null, window, 'USD')).toMatchObject({
        moneyIn: 0,
        moneyOut: 0,
        net: 0,
        transactionsCount: 0,
      });
      expect(
        summarizeBankAccountActivity(
          { debit: null, credit: null, count: null },
          window,
          'USD',
        ).moneyInFormatted,
      ).toBe('0.00');
    });
  });
});
