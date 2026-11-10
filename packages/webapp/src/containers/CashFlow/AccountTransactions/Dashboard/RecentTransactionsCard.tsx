import { Button, Classes, HTMLTable, Intent, Tag } from '@blueprintjs/core';
import clsx from 'classnames';
import React from 'react';
import intl from 'react-intl-universal';
import styled from 'styled-components';
import { useAccountTransactionsContext } from '../AccountTransactionsProvider';
import { MutedText, SummaryCard } from './components';
import type { BankingTransactionResponse } from '@bigcapital/sdk-ts';
import { useAccountTransactionsInfinity } from '@/hooks/query';

/** Number of rows shown on the summary tab. */
export const RECENT_TRANSACTIONS_LIMIT = 5;

/**
 * Row of GET /banking/transactions. The OpenAPI schema does not declare the
 * formatted columns the table renders, so surface them as optional here.
 */
type RecentTransactionRow = BankingTransactionResponse & {
  id?: number;
  formattedDate?: string;
  formattedTransactionType?: string;
  referenceNumber?: string | null;
  transactionNumber?: string | null;
  status?: string;
  formattedStatus?: string;
  formattedDeposit?: string;
  formattedWithdrawal?: string;
  formattedRunningBalance?: string;
};

export function RecentTransactionsCard() {
  const { accountId, setFilterTab } = useAccountTransactionsContext();

  // First page only; the summary tab never paginates.
  const { data, isLoading } = useAccountTransactionsInfinity(accountId, {
    accountId,
    pageSize: RECENT_TRANSACTIONS_LIMIT,
  });
  const rows = (
    (data?.pages?.[0]?.transactions ?? []) as RecentTransactionRow[]
  ).slice(0, RECENT_TRANSACTIONS_LIMIT);

  return (
    <SummaryCard
      title={intl.get('banking.summary.recent.title')}
      subtitle={intl.get('banking.summary.recent.subtitle')}
      action={
        <Button
          small
          minimal
          intent={Intent.PRIMARY}
          rightIcon="arrow-right"
          onClick={() => setFilterTab('all')}
          data-testid="bank-summary-view-all"
        >
          {intl.get('banking.summary.recent.view_all')}
        </Button>
      }
    >
      {!isLoading && rows.length === 0 ? (
        <MutedText>{intl.get('banking.summary.recent.empty')}</MutedText>
      ) : (
        <RecentTable condensed striped>
          <thead>
            <tr>
              <th>{intl.get('date')}</th>
              <th>{intl.get('type')}</th>
              <th>Ref.#</th>
              <th>Status</th>
              <th className="num">{intl.get('banking.label.deposit')}</th>
              <th className="num">{intl.get('banking.label.withdrawal')}</th>
              <th className="num">
                {intl.get('banking.label.running_balance')}
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: RECENT_TRANSACTIONS_LIMIT }).map(
                  (_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((__, j) => (
                        <td key={j}>
                          <span className={Classes.SKELETON}>0000-00-00</span>
                        </td>
                      ))}
                    </tr>
                  ),
                )
              : rows.map((row, index) => (
                  <tr key={row.id ?? index}>
                    <td>{row.formattedDate}</td>
                    <td>{row.formattedTransactionType}</td>
                    <td>
                      {row.referenceNumber || row.transactionNumber || ''}
                    </td>
                    <td>
                      {row.formattedStatus && (
                        <Tag
                          minimal={row.status === 'manual'}
                          intent={
                            row.status === 'categorized' ||
                            row.status === 'matched'
                              ? Intent.SUCCESS
                              : Intent.NONE
                          }
                        >
                          {row.formattedStatus}
                        </Tag>
                      )}
                    </td>
                    <td className={clsx('num', 'deposit')}>
                      {row.formattedDeposit}
                    </td>
                    <td className={clsx('num', 'withdrawal')}>
                      {row.formattedWithdrawal}
                    </td>
                    <td className="num">{row.formattedRunningBalance}</td>
                  </tr>
                ))}
          </tbody>
        </RecentTable>
      )}
    </SummaryCard>
  );
}

const RecentTable = styled(HTMLTable)`
  width: 100%;
  font-size: 13px;

  th,
  td {
    white-space: nowrap;
    vertical-align: middle;
  }
  th {
    font-weight: 600;
    opacity: 0.75;
  }
  .num {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
  td.deposit:not(:empty) {
    color: var(--color-success, #0f9960);
  }
`;
