import { Classes, Intent } from '@blueprintjs/core';
import clsx from 'classnames';
import React from 'react';
import styled, { css } from 'styled-components';

/**
 * Card container shared by the summary tab sections.
 */
export const SummaryCardRoot = styled.section`
  background: var(--color-bank-transactions-content-background);
  border: 2px solid var(--color-bank-transactions-content-border);
  border-radius: 10px;
  padding: 22px 24px;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const SummaryCardHeader = styled.header`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
`;

const SummaryCardTitle = styled.h3`
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.3;
`;

const SummaryCardSubtitle = styled.div`
  margin-top: 2px;
  font-size: 12px;
  opacity: 0.65;
`;

const SummaryCardAction = styled.div`
  flex-shrink: 0;
`;

interface SummaryCardProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export function SummaryCard({
  title,
  subtitle,
  action,
  className,
  children,
}: SummaryCardProps) {
  return (
    <SummaryCardRoot className={className}>
      <SummaryCardHeader>
        <div>
          <SummaryCardTitle>{title}</SummaryCardTitle>
          {subtitle && <SummaryCardSubtitle>{subtitle}</SummaryCardSubtitle>}
        </div>
        {action && <SummaryCardAction>{action}</SummaryCardAction>}
      </SummaryCardHeader>
      {children}
    </SummaryCardRoot>
  );
}

/**
 * Responsive grid of stat tiles inside a card.
 */
export const StatsGrid = styled.div<{ columns?: number }>`
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(${(p) => (p.columns && p.columns > 2 ? 120 : 150)}px, 1fr)
  );
  gap: 18px 24px;
`;

const StatRoot = styled.div<{ clickable?: boolean }>`
  min-width: 0;
  ${(p) =>
    p.clickable &&
    css`
      cursor: pointer;
      border-radius: 6px;
      margin: -6px -8px;
      padding: 6px 8px;
      transition: background 0.1s ease-in-out;

      &:hover {
        background: rgba(0, 0, 0, 0.04);
      }
      .bp4-dark &:hover {
        background: rgba(255, 255, 255, 0.06);
      }
    `}
`;

const StatLabel = styled.div`
  font-size: 12px;
  opacity: 0.7;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StatValue = styled.div<{ intent?: Intent; size?: 'lg' | 'md' }>`
  font-size: ${(p) => (p.size === 'lg' ? 22 : 18)}px;
  font-weight: 600;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  ${(p) =>
    p.intent === Intent.DANGER &&
    css`
      color: var(--color-danger);
    `}
  ${(p) =>
    p.intent === Intent.SUCCESS &&
    css`
      color: var(--color-success, #0f9960);
    `}
`;

const StatHint = styled.div`
  font-size: 11px;
  opacity: 0.6;
  margin-top: 3px;
`;

interface StatProps {
  label: React.ReactNode;
  value: React.ReactNode;
  hint?: React.ReactNode;
  intent?: Intent;
  size?: 'lg' | 'md';
  loading?: boolean;
  onClick?: () => void;
  'data-testid'?: string;
}

/**
 * A labelled figure; renders a skeleton while loading.
 */
export function Stat({
  label,
  value,
  hint,
  intent,
  size = 'md',
  loading,
  onClick,
  ...rest
}: StatProps) {
  return (
    <StatRoot
      clickable={!!onClick}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      data-testid={rest['data-testid']}
    >
      <StatLabel>{label}</StatLabel>
      <StatValue
        intent={intent}
        size={size}
        className={clsx({ [Classes.SKELETON]: loading })}
      >
        {loading ? '0,000.00' : value}
      </StatValue>
      {hint && <StatHint>{hint}</StatHint>}
    </StatRoot>
  );
}

/**
 * Key/value rows (e.g. feed status).
 */
export const DetailsList = styled.dl`
  margin: 0;
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 10px 18px;
  font-size: 13px;

  dt {
    opacity: 0.7;
  }
  dd {
    margin: 0;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const MutedText = styled.p`
  margin: 0;
  font-size: 13px;
  opacity: 0.7;
`;
