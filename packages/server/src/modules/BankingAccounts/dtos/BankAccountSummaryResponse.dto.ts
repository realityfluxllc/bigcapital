import { ApiProperty } from '@nestjs/swagger';

export class BankAccountActivitySummaryDto {
  @ApiProperty({
    description: 'Window start date (YYYY-MM-DD).',
    example: '2026-10-12',
  })
  fromDate: string;

  @ApiProperty({
    description: 'Window end date (YYYY-MM-DD).',
    example: '2026-11-10',
  })
  toDate: string;

  @ApiProperty({
    description: 'Total money that flowed into the account (GL debits).',
    example: 1500.5,
  })
  moneyIn: number;

  @ApiProperty({
    description: 'Total money that flowed out of the account (GL credits).',
    example: 420,
  })
  moneyOut: number;

  @ApiProperty({ description: 'Money in minus money out.', example: 1080.5 })
  net: number;

  @ApiProperty({
    description: 'Number of GL entries in the window.',
    example: 7,
  })
  transactionsCount: number;

  @ApiProperty({ example: '1,500.50' })
  moneyInFormatted: string;

  @ApiProperty({ example: '420.00' })
  moneyOutFormatted: string;

  @ApiProperty({ example: '1,080.50' })
  netFormatted: string;
}

export class BankAccountSummaryResponseDto {
  @ApiProperty({ description: 'The bank account name.', example: 'Checking' })
  name: string;

  @ApiProperty({
    description: 'The bank account currency code.',
    example: 'USD',
  })
  currencyCode: string;

  @ApiProperty({
    description: 'Uncategorized bank transactions awaiting review.',
    example: 12,
  })
  totalUncategorizedTransactions: number;

  @ApiProperty({
    description: 'Uncategorized transactions matched by a bank rule.',
    example: 3,
  })
  totalRecognizedTransactions: number;

  @ApiProperty({ description: 'Excluded bank transactions.', example: 1 })
  totalExcludedTransactions: number;

  @ApiProperty({
    description: 'Pending (not yet posted) bank transactions.',
    example: 0,
  })
  totalPendingTransactions: number;

  @ApiProperty({
    description: 'Total GL entries recorded against the account.',
    example: 340,
  })
  totalTransactions: number;

  @ApiProperty({
    description: 'Date of the most recent GL entry (YYYY-MM-DD), null if none.',
    example: '2026-11-09',
    nullable: true,
  })
  lastTransactionDate: string | null;

  @ApiProperty({ example: '2026 Nov 09', nullable: true })
  lastTransactionDateFormatted: string | null;

  @ApiProperty({
    description: 'Money in/out over the last 30 days.',
    type: BankAccountActivitySummaryDto,
  })
  last30Days: BankAccountActivitySummaryDto;
}
