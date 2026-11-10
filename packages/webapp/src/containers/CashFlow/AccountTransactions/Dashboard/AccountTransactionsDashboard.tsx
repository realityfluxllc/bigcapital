import { Button, Intent, Tag } from '@blueprintjs/core';
import React from 'react';
import intl from 'react-intl-universal';
import styled from 'styled-components';
import { useAccountTransactionsContext } from '../AccountTransactionsProvider';
import {
  DetailsList,
  MutedText,
  Stat,
  StatsGrid,
  SummaryCard,
} from './components';
import { RecentTransactionsCard } from './RecentTransactionsCard';
import {
  getBalanceDifference,
  getBankFeedProvider,
  getBankFeedStatus,
} from './utils';
import type { BankFeedAccountLike } from './utils';
import type { Account } from '@bigcapital/sdk-ts';
import { useAppQueryString } from '@/hooks';
import { formattedAmount } from '@/utils';

/**
 * Bank account as served at runtime. The generated `Account` type lags behind
 * the server transformer, so the extra fields are declared optional here.
 */
type SummaryAccount = Account &
  BankFeedAccountLike & {
    formattedAmount?: string;
    bankBalanceFormatted?: string;
    lastFeedsUpdatedAt?: string | null;
    lastFeedsUpdatedAtFormatted?: string;
    lastFeedsUpdatedFromNow?: string;
  };

const useSummaryAccount = () => {
  const { currentAccount, isCurrentAccountLoading } =
    useAccountTransactionsContext();
  return {
    currentAccount: currentAccount as SummaryAccount | undefined,
    isCurrentAccountLoading,
  };
};

const Box = styled.div`
  margin: 30px 15px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
`;

/**
 * Account summary ("Dashboard") tab of the bank account transactions page.
 */
export function AccountTransactionsDashboard() {
  return (
    <Box>
      <CardsGrid>
        <BalancesCard />
        <ReviewCard />
        <BankFeedCard />
        <ActivityCard />
      </CardsGrid>
      <RecentTransactionsCard />
    </Box>
  );
}

function BalancesCard() {
  const { currentAccount, isCurrentAccountLoading } = useSummaryAccount();

  const isConnected = !!currentAccount?.isFeedsActive;
  const difference = getBalanceDifference(currentAccount);
  const currencyCode = currentAccount?.currencyCode ?? '';

  return (
    <SummaryCard title={intl.get('banking.summary.balances.title')}>
      <StatsGrid>
        <Stat
          size="lg"
          label={intl.get('banking.summary.balances.in_bigcapital')}
          value={currentAccount?.formattedAmount}
          hint={currencyCode}
          loading={isCurrentAccountLoading}
          data-testid="bank-summary-book-balance"
        />
        {isConnected && (
          <Stat
            size="lg"
            label={intl.get('banking.summary.balances.in_bank')}
            value={currentAccount?.bankBalanceFormatted}
            hint={currentAccount?.lastFeedsUpdatedFromNow}
            loading={isCurrentAccountLoading}
            data-testid="bank-summary-bank-balance"
          />
        )}
        {isConnected && difference !== null && (
          <Stat
            label={intl.get('banking.summary.balances.difference')}
            value={formattedAmount(difference, currencyCode)}
            intent={difference !== 0 ? Intent.DANGER : Intent.SUCCESS}
            hint={
              difference !== 0
                ? intl.get('banking.summary.balances.difference_hint')
                : intl.get('banking.summary.balances.in_sync')
            }
            loading={isCurrentAccountLoading}
            data-testid="bank-summary-balance-difference"
          />
        )}
      </StatsGrid>
    </SummaryCard>
  );
}

function ReviewCard() {
  const { bankAccountMetaSummary, isBankAccountMetaSummaryLoading } =
    useAccountTransactionsContext();
  const [, setLocationQuery] = useAppQueryString();

  const uncategorized =
    bankAccountMetaSummary?.totalUncategorizedTransactions ?? 0;
  const recognized = bankAccountMetaSummary?.totalRecognizedTransactions ?? 0;
  const pending = bankAccountMetaSummary?.totalPendingTransactions ?? 0;
  const excluded = bankAccountMetaSummary?.totalExcludedTransactions ?? 0;
  const hasAnything = uncategorized + recognized + pending + excluded > 0;

  // Jumps to the uncategorized tab, optionally into one of its sub-filters.
  const openReview = (uncategorizedFilter?: string) => () =>
    setLocationQuery({
      filter: 'uncategorized',
      uncategorizedFilter: uncategorizedFilter ?? 'all',
    });

  return (
    <SummaryCard
      title={intl.get('banking.summary.review.title')}
      subtitle={intl.get('banking.summary.review.subtitle')}
      action={
        hasAnything && (
          <Button
            small
            minimal
            intent={Intent.PRIMARY}
            rightIcon="arrow-right"
            onClick={openReview()}
            data-testid="bank-summary-open-review"
          >
            {intl.get('banking.summary.review.open')}
          </Button>
        )
      }
    >
      {!isBankAccountMetaSummaryLoading && !hasAnything ? (
        <MutedText>{intl.get('banking.summary.review.all_done')}</MutedText>
      ) : (
        <StatsGrid columns={4}>
          <Stat
            size="lg"
            label={intl.get('banking.summary.review.uncategorized')}
            value={uncategorized}
            intent={uncategorized > 0 ? Intent.DANGER : undefined}
            loading={isBankAccountMetaSummaryLoading}
            onClick={openReview('all')}
            data-testid="bank-summary-uncategorized"
          />
          <Stat
            label={intl.get('banking.summary.review.recognized')}
            value={recognized}
            loading={isBankAccountMetaSummaryLoading}
            onClick={openReview('recognized')}
            data-testid="bank-summary-recognized"
          />
          <Stat
            label={intl.get('banking.summary.review.pending')}
            value={pending}
            loading={isBankAccountMetaSummaryLoading}
            onClick={openReview('pending')}
            data-testid="bank-summary-pending"
          />
          <Stat
            label={intl.get('banking.summary.review.excluded')}
            value={excluded}
            loading={isBankAccountMetaSummaryLoading}
            onClick={openReview('excluded')}
            data-testid="bank-summary-excluded"
          />
        </StatsGrid>
      )}
    </SummaryCard>
  );
}

function BankFeedCard() {
  const { currentAccount } = useSummaryAccount();

  const provider = getBankFeedProvider(currentAccount);
  const status = getBankFeedStatus(currentAccount);

  const statusIntent =
    status === 'active'
      ? Intent.SUCCESS
      : status === 'paused'
        ? Intent.WARNING
        : Intent.NONE;

  return (
    <SummaryCard title={intl.get('banking.summary.feed.title')}>
      {status === 'not_connected' ? (
        <MutedText>
          {intl.get('banking.summary.feed.not_connected_text')}
        </MutedText>
      ) : (
        <DetailsList>
          <dt>{intl.get('banking.summary.feed.provider')}</dt>
          <dd data-testid="bank-summary-feed-provider">
            {provider
              ? intl.get(`banking.summary.feed.provider.${provider}`)
              : '—'}
          </dd>

          <dt>{intl.get('banking.summary.feed.status')}</dt>
          <dd>
            <Tag
              intent={statusIntent}
              minimal
              data-testid="bank-summary-feed-status"
            >
              {intl.get(`banking.summary.feed.status.${status}`)}
            </Tag>
          </dd>

          <dt>{intl.get('banking.summary.feed.last_synced')}</dt>
          <dd data-testid="bank-summary-feed-last-synced">
            {currentAccount?.lastFeedsUpdatedAt
              ? `${currentAccount.lastFeedsUpdatedFromNow} (${currentAccount.lastFeedsUpdatedAtFormatted})`
              : intl.get('banking.summary.feed.never_synced')}
          </dd>
        </DetailsList>
      )}
    </SummaryCard>
  );
}

function ActivityCard() {
  const { bankAccountMetaSummary, isBankAccountMetaSummaryLoading } =
    useAccountTransactionsContext();

  const activity = bankAccountMetaSummary?.last30Days;
  const net = activity?.net ?? 0;

  return (
    <SummaryCard
      title={intl.get('banking.summary.activity.title')}
      subtitle={
        activity &&
        intl.get('banking.summary.activity.range', {
          fromDate: activity.fromDate,
          toDate: activity.toDate,
        })
      }
    >
      <StatsGrid columns={4}>
        <Stat
          label={intl.get('banking.summary.activity.money_in')}
          value={activity?.moneyInFormatted}
          intent={Intent.SUCCESS}
          loading={isBankAccountMetaSummaryLoading}
          data-testid="bank-summary-money-in"
        />
        <Stat
          label={intl.get('banking.summary.activity.money_out')}
          value={activity?.moneyOutFormatted}
          loading={isBankAccountMetaSummaryLoading}
          data-testid="bank-summary-money-out"
        />
        <Stat
          label={intl.get('banking.summary.activity.net')}
          value={activity?.netFormatted}
          intent={net < 0 ? Intent.DANGER : undefined}
          loading={isBankAccountMetaSummaryLoading}
          data-testid="bank-summary-net"
        />
        <Stat
          label={intl.get('banking.summary.activity.transactions')}
          value={activity?.transactionsCount}
          loading={isBankAccountMetaSummaryLoading}
          data-testid="bank-summary-activity-count"
        />
      </StatsGrid>

      <AllTimeNote>
        {bankAccountMetaSummary &&
          (bankAccountMetaSummary.totalTransactions > 0
            ? intl.get('banking.summary.activity.all_time', {
                count: bankAccountMetaSummary.totalTransactions,
                date: bankAccountMetaSummary.lastTransactionDateFormatted,
              })
            : intl.get('banking.summary.activity.all_time_none'))}
      </AllTimeNote>
    </SummaryCard>
  );
}

const AllTimeNote = styled(MutedText)`
  margin-top: 18px;
`;
