import { Inject, Injectable } from '@nestjs/common';
import { Account } from '@/modules/Accounts/models/Account.model';
import { UncategorizedBankTransaction } from '@/modules/BankingTransactions/models/UncategorizedBankTransaction';
import { TenantModelProxy } from '@/modules/System/models/TenantBaseModel';
import { Knex } from 'knex';
import { TENANCY_DB_CONNECTION } from '@/modules/Tenancy/TenancyDB/TenancyDB.constants';
import { initialize } from 'objection';
import { MatchedBankTransaction } from '@/modules/BankingMatching/models/MatchedBankTransaction';
import { RecognizedBankTransaction } from '@/modules/BankingTranasctionsRegonize/models/RecognizedBankTransaction';
import { AccountTransaction } from '@/modules/Accounts/models/AccountTransaction.model';
import {
  getLastDaysWindow,
  summarizeBankAccountActivity,
} from './BankAccountSummary.utils';
import * as moment from 'moment';

/** Number of days covered by the recent activity summary. */
const RECENT_ACTIVITY_DAYS = 30;

@Injectable()
export class GetBankAccountSummary {
  constructor(
    @Inject(Account.name)
    private readonly accountModel: TenantModelProxy<typeof Account>,

    @Inject(UncategorizedBankTransaction.name)
    private readonly uncategorizedBankTransactionModel: TenantModelProxy<
      typeof UncategorizedBankTransaction
    >,

    @Inject(MatchedBankTransaction.name)
    private readonly matchedBankTransactionModel: TenantModelProxy<
      typeof MatchedBankTransaction
    >,

    @Inject(RecognizedBankTransaction.name)
    private readonly recognizedBankTransaction: TenantModelProxy<
      typeof RecognizedBankTransaction
    >,

    @Inject(AccountTransaction.name)
    private readonly accountTransactionModel: TenantModelProxy<
      typeof AccountTransaction
    >,

    @Inject(TENANCY_DB_CONNECTION)
    private readonly tenantDb: () => Knex,
  ) {}

  /**
   * Retrieves the bank account meta summary
   * @param {number} bankAccountId - The bank account id.
   * @returns {Promise<IBankAccountSummary>}
   */
  public async getBankAccountSummary(bankAccountId: number) {
    const bankAccount = await this.accountModel()
      .query()
      .findById(bankAccountId)
      .throwIfNotFound();

    await initialize(this.tenantDb(), [
      this.uncategorizedBankTransactionModel(),
      this.matchedBankTransactionModel(),
      this.recognizedBankTransaction(),
    ]);
    const commonQuery = (q) => {
      // Include just the given account.
      q.where('accountId', bankAccountId);

      // Only the not excluded.
      q.modify('notExcluded');

      // Only the not categorized.
      q.modify('notCategorized');
    };
    // Retrieves the uncategorized transactions count of the given bank account.
    const uncategorizedTranasctionsCount =
      await this.uncategorizedBankTransactionModel()
        .query()
        .onBuild((q) => {
          commonQuery(q);

          // Only the not matched bank transactions.
          q.withGraphJoined('matchedBankTransactions');
          q.whereNull('matchedBankTransactions.id');

          // Exclude the pending transactions.
          q.modify('notPending');

          // Count the results.
          q.count('uncategorized_cashflow_transactions.id as total');
          q.first();
        });

    // Retrives the recognized transactions count.
    const recognizedTransactionsCount =
      await this.uncategorizedBankTransactionModel()
        .query()
        .onBuild((q) => {
          commonQuery(q);

          q.withGraphJoined('recognizedTransaction');
          q.whereNotNull('recognizedTransaction.id');

          // Exclude the pending transactions.
          q.modify('notPending');

          // Count the results.
          q.count('uncategorized_cashflow_transactions.id as total');
          q.first();
        });
    // Retrieves excluded transactions count.
    const excludedTransactionsCount =
      await this.uncategorizedBankTransactionModel()
        .query()
        .onBuild((q) => {
          q.where('accountId', bankAccountId);
          q.modify('excluded');

          // Exclude the pending transactions.
          q.modify('notPending');

          // Count the results.
          q.count('uncategorized_cashflow_transactions.id as total');
          q.first();
        });

    // Retrieves the pending transactions count.
    const pendingTransactionsCount =
      await this.uncategorizedBankTransactionModel()
        .query()
        .onBuild((q) => {
          q.where('accountId', bankAccountId);
          q.modify('pending');

          // Count the results.
          q.count('uncategorized_cashflow_transactions.id as total');
          q.first();
        });

    const totalUncategorizedTransactions =
      // @ts-ignore
      uncategorizedTranasctionsCount?.total || 0;
    // @ts-ignore
    const totalRecognizedTransactions = recognizedTransactionsCount?.total || 0;
    // @ts-ignore
    const totalExcludedTransactions = excludedTransactionsCount?.total || 0;
    // @ts-ignore
    const totalPendingTransactions = pendingTransactionsCount?.total || 0;

    // GL activity of the account: all-time totals and the recent window.
    // Same scope as the "All transactions" tab (no accounting-basis filter).
    const recentWindow = getLastDaysWindow(RECENT_ACTIVITY_DAYS);

    const recentTotals = await this.accountTransactionModel()
      .query()
      .where('accountId', bankAccountId)
      .modify('filterDateRange', recentWindow.fromDate, recentWindow.toDate)
      .sum('debit as debit')
      .sum('credit as credit')
      .count('id as count')
      .first();

    const allTimeTotals = await this.accountTransactionModel()
      .query()
      .where('accountId', bankAccountId)
      .count('id as count')
      .max('date as lastDate')
      .first();

    // @ts-ignore
    const totalTransactions = Number(allTimeTotals?.count) || 0;
    // @ts-ignore
    const lastDate = allTimeTotals?.lastDate as string | Date | null;
    const lastTransactionDate = lastDate
      ? moment(lastDate).format('YYYY-MM-DD')
      : null;

    return {
      name: bankAccount.name,
      currencyCode: bankAccount.currencyCode,
      totalUncategorizedTransactions,
      totalRecognizedTransactions,
      totalExcludedTransactions,
      totalPendingTransactions,
      totalTransactions,
      lastTransactionDate,
      lastTransactionDateFormatted: lastTransactionDate
        ? moment(lastTransactionDate).format('YYYY MMM DD')
        : null,
      last30Days: summarizeBankAccountActivity(
        // @ts-ignore
        recentTotals,
        recentWindow,
        bankAccount.currencyCode,
      ),
    };
  }
}
