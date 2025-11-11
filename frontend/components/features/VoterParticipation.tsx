'use client';

import { useCallback, useMemo, useState } from 'react';
import { Badge } from '../ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import {
  ActionVoterParticipation,
  CommitteeParticipation,
  DRepParticipation,
  StakePoolParticipation,
  VoteChoice,
} from '@/types/governance';
import { cn, formatDate, formatVotingPower as formatAdaVotingPower } from '@/lib/utils';

type FilterStatus = 'all' | 'voted' | 'missing';
type GroupFilter = 'all' | 'dreps' | 'pools' | 'committee';

interface ParticipationViewProps {
  participation: ActionVoterParticipation;
}

interface ParticipationSectionProps<TParticipant> {
  title: string;
  summaryLabel: string;
  participants: TParticipant[];
  summaryTotal: number;
  summaryVoted: number;
  summaryMissing: number;
  turnoutPercentage?: number;
  searchTerm: string;
  statusFilter: FilterStatus;
  initialLimit?: number;
  renderItem: (participant: TParticipant) => React.ReactNode;
  getSearchableValue: (participant: TParticipant) => string;
  emptyLabel: string;
}

const DEFAULT_LIMIT = 200;

function formatVoteLabel(vote?: VoteChoice) {
  if (!vote) {
    return '—';
  }
  return vote.charAt(0).toUpperCase() + vote.slice(1);
}

function VoteBadge({ vote }: { vote?: VoteChoice }) {
  if (!vote) {
    return <Badge variant="warning">No ballot</Badge>;
  }

  const variant = vote === 'yes' ? 'success' : vote === 'no' ? 'error' : 'info';
  return <Badge variant={variant}>{formatVoteLabel(vote)}</Badge>;
}

function VoteStatusBadge({ hasVoted }: { hasVoted: boolean }) {
  return hasVoted ? (
    <Badge variant="success">Voted</Badge>
  ) : (
    <Badge variant="warning">Pending</Badge>
  );
}

function toCsvValue(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function hasParticipantVoted(participant: unknown): boolean {
  if (participant && typeof participant === 'object') {
    const typed = participant as { has_voted?: unknown; hasVoted?: unknown };
    if (typeof typed.has_voted === 'boolean') {
      return typed.has_voted;
    }
    if (typeof typed.hasVoted === 'boolean') {
      return typed.hasVoted;
    }
  }
  return false;
}

function ParticipationSection<TParticipant>({
  title,
  summaryLabel,
  participants,
  summaryTotal,
  summaryVoted,
  summaryMissing,
  turnoutPercentage,
  searchTerm,
  statusFilter,
  initialLimit = DEFAULT_LIMIT,
  renderItem,
  getSearchableValue,
  emptyLabel,
}: ParticipationSectionProps<TParticipant>) {
  const [visibleCount, setVisibleCount] = useState(initialLimit);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch = (participant: TParticipant) => {
      if (!term) {
        return true;
      }

      const value = getSearchableValue(participant);
      return value.toLowerCase().includes(term);
    };

    const matchesStatus = (participant: TParticipant) => {
      if (statusFilter === 'all') {
        return true;
      }

      const voted = hasParticipantVoted(participant);
      return statusFilter === 'voted' ? voted : !voted;
    };

    return participants.filter(
      (participant) => matchesSearch(participant) && matchesStatus(participant)
    );
  }, [participants, searchTerm, statusFilter]);

  const visible = filtered.slice(0, visibleCount);
  const remaining = filtered.length - visible.length;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {summaryLabel}:{' '}
              <span className="font-semibold text-foreground">
                {summaryVoted} / {summaryTotal}
              </span>
              {turnoutPercentage !== undefined && (
                <span className="ml-2 text-xs text-muted-foreground">
                  ({turnoutPercentage.toFixed(1)}% turnout)
                </span>
              )}
            </p>
          </div>

          <div className="rounded-md border border-border/50 bg-muted/40 px-3 py-1.5 text-xs">
            <p className="font-semibold text-foreground">Status</p>
            <p className="text-muted-foreground">
              {summaryVoted} voted • {summaryMissing} pending
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {visible.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          <div className="divide-y divide-border/60 rounded-md border border-border/60 bg-muted/20">
            {visible.map((participant, index) => (
              <div key={index} className="px-4 py-3">
                {renderItem(participant)}
              </div>
            ))}
          </div>
        )}

        {remaining > 0 && (
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + initialLimit)}
            className="w-full rounded-md border border-border bg-background py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Show {Math.min(initialLimit, remaining)} more
            {remaining > initialLimit ? ` (${remaining} remaining)` : ''}
          </button>
        )}
      </CardContent>
    </Card>
  );
}

function renderDRep(participant: DRepParticipation) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-foreground">
            {participant.given_name || participant.drep_id}
          </span>
          <VoteStatusBadge hasVoted={hasParticipantVoted(participant)} />
          <VoteBadge vote={participant.vote} />
          {participant.has_profile && <Badge variant="info">Profile</Badge>}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span>{participant.drep_id}</span>
          {participant.view && <span>{participant.view}</span>}
        </div>
      </div>
      <div className="space-y-1 text-sm text-right">
        <p className="text-muted-foreground">Voting Power</p>
        <p className="font-semibold text-foreground">
          {participant.voting_power ? formatAdaVotingPower(participant.voting_power) : '—'}
        </p>
        {participant.block_time && (
          <p className="text-xs text-muted-foreground">
            {formatDate(new Date(participant.block_time * 1000), 'DATETIME')}
          </p>
        )}
      </div>
    </div>
  );
}

function renderStakePool(participant: StakePoolParticipation) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-foreground">
            {participant.ticker || participant.name || participant.pool_id}
          </span>
          <VoteStatusBadge hasVoted={hasParticipantVoted(participant)} />
          <VoteBadge vote={participant.vote} />
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span>{participant.pool_id}</span>
          {participant.name && <span>{participant.name}</span>}
        </div>
      </div>
      <div className="space-y-1 text-sm text-right">
        <p className="text-muted-foreground">Voting Power</p>
        <p className="font-semibold text-foreground">
          {participant.voting_power ? formatAdaVotingPower(participant.voting_power) : '—'}
        </p>
        {participant.block_time && (
          <p className="text-xs text-muted-foreground">
            {formatDate(new Date(participant.block_time * 1000), 'DATETIME')}
          </p>
        )}
      </div>
    </div>
  );
}

function renderCommitteeMember(participant: CommitteeParticipation) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-foreground">{participant.identifier}</span>
          <VoteStatusBadge hasVoted={hasParticipantVoted(participant)} />
          <VoteBadge vote={participant.vote} />
          {participant.role && <Badge variant="outline">{participant.role}</Badge>}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {participant.hot_key && <span>Hot: {participant.hot_key}</span>}
          {participant.cold_key && <span>Cold: {participant.cold_key}</span>}
        </div>
      </div>
      <div className="space-y-1 text-sm text-right">
        <p className="text-muted-foreground">Voting Power</p>
        <p className="font-semibold text-foreground">
          {participant.voting_power ? formatAdaVotingPower(participant.voting_power) : '—'}
        </p>
        {participant.block_time && (
          <p className="text-xs text-muted-foreground">
            {formatDate(new Date(participant.block_time * 1000), 'DATETIME')}
          </p>
        )}
      </div>
    </div>
  );
}

export function VoterParticipationView({ participation }: ParticipationViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [groupFilter, setGroupFilter] = useState<GroupFilter>('all');
  const [isExporting, setIsExporting] = useState(false);

  const totalParticipants =
    participation.dreps.summary.total_eligible +
    participation.stake_pools.summary.total_eligible +
    participation.committee.summary.total_eligible;

  const handleExport = useCallback(() => {
    try {
      setIsExporting(true);

      const headers = [
        'voter_type',
        'identifier',
        'display_name',
        'role_or_ticker',
        'vote',
        'has_voted',
        'voting_power',
        'tx_hash',
        'cert_index',
        'block_time',
        'metadata',
      ];

      const rows: string[][] = [];

      const pushRow = (
        voterType: string,
        identifier: string,
        displayName: string | undefined,
        roleOrTicker: string | undefined,
        vote: VoteChoice | undefined,
        hasVoted: boolean,
        votingPower: string | undefined,
        txHash: string | undefined,
        certIndex: number | undefined,
        blockTimeSeconds: number | undefined,
        metadata: string | undefined
      ) => {
        const blockTime = blockTimeSeconds
          ? new Date(blockTimeSeconds * 1000).toISOString()
          : undefined;

        rows.push([
          toCsvValue(voterType),
          toCsvValue(identifier),
          toCsvValue(displayName ?? ''),
          toCsvValue(roleOrTicker ?? ''),
          toCsvValue(vote ? formatVoteLabel(vote).toLowerCase() : ''),
          toCsvValue(hasVoted ? 'true' : 'false'),
          toCsvValue(votingPower ?? ''),
          toCsvValue(txHash ?? ''),
          toCsvValue(
            typeof certIndex === 'number' && Number.isFinite(certIndex) ? certIndex : undefined
          ),
          toCsvValue(blockTime ?? ''),
          toCsvValue(metadata ?? ''),
        ]);
      };

      participation.dreps.participants.forEach((participant) => {
        pushRow(
          'drep',
          participant.drep_id,
          participant.given_name ?? participant.drep_id,
          participant.view,
          participant.vote,
          hasParticipantVoted(participant),
          participant.voting_power,
          participant.tx_hash,
          participant.cert_index,
          participant.block_time,
          participant.hex || ''
        );
      });

      participation.stake_pools.participants.forEach((participant) => {
        pushRow(
          'stake_pool',
          participant.pool_id,
          participant.name ?? participant.pool_id,
          participant.ticker,
          participant.vote,
          hasParticipantVoted(participant),
          participant.voting_power,
          participant.tx_hash,
          participant.cert_index,
          participant.block_time,
          participant.homepage ?? ''
        );
      });

      participation.committee.participants.forEach((participant) => {
        const metadataParts = [
          participant.hot_key ? `hot=${participant.hot_key}` : null,
          participant.cold_key ? `cold=${participant.cold_key}` : null,
          participant.expiry_epoch ? `expiry_epoch=${participant.expiry_epoch}` : null,
        ]
          .filter(Boolean)
          .join('; ');

        pushRow(
          'committee',
          participant.identifier,
          participant.identifier,
          participant.role,
          participant.vote,
          hasParticipantVoted(participant),
          participant.voting_power,
          participant.tx_hash,
          participant.cert_index,
          participant.block_time,
          metadataParts || undefined
        );
      });

      const csvContent = [
        headers.map((header) => toCsvValue(header)).join(','),
        ...rows.map((row) => row.join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `voter_participation_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  }, [participation]);

  return (
    <div className="space-y-6">
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Participation Overview</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="grid gap-2 text-sm text-muted-foreground">
            <span>
              Observing {totalParticipants.toLocaleString()} registered voters across all roles.
            </span>
            <span>
              {participation.dreps.summary.total_voted.toLocaleString()} DRep ballots •{' '}
              {participation.stake_pools.summary.total_voted.toLocaleString()} pool ballots •{' '}
              {participation.committee.summary.total_voted.toLocaleString()} committee ballots
              recorded.
            </span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Participation Status
              </span>
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  filter === 'all'
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground'
                )}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilter('voted')}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  filter === 'voted'
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground'
                )}
              >
                Voted
              </button>
              <button
                type="button"
                onClick={() => setFilter('missing')}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  filter === 'missing'
                    ? 'border-amber-500 bg-amber-500 text-white'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground'
                )}
              >
                Pending
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Voter Type
              </span>
              <button
                type="button"
                onClick={() => setGroupFilter('all')}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  groupFilter === 'all'
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground'
                )}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setGroupFilter('dreps')}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  groupFilter === 'dreps'
                    ? 'border-field-green bg-field-green text-white'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground'
                )}
              >
                DReps
              </button>
              <button
                type="button"
                onClick={() => setGroupFilter('pools')}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  groupFilter === 'pools'
                    ? 'border-sky-blue bg-sky-blue text-white'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground'
                )}
              >
                Stake Pools
              </button>
              <button
                type="button"
                onClick={() => setGroupFilter('committee')}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  groupFilter === 'committee'
                    ? 'border-violet-500 bg-violet-500 text-white'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground'
                )}
              >
                Committee
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search voters by name, ticker, or identifier..."
            className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-field-green"
          />
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className={cn(
            'inline-flex items-center justify-center rounded-md border border-field-green bg-field-green px-4 py-2 text-sm font-medium text-white transition-colors',
            isExporting && 'opacity-75'
          )}
        >
          {isExporting ? 'Preparing CSV…' : 'Export CSV'}
        </button>
      </div>

      {(groupFilter === 'all' || groupFilter === 'dreps') && (
        <ParticipationSection<DRepParticipation>
          title="Delegated Representatives (DReps)"
          summaryLabel="Ballots cast"
          participants={participation.dreps.participants}
          summaryTotal={participation.dreps.summary.total_eligible}
          summaryVoted={participation.dreps.summary.total_voted}
          summaryMissing={participation.dreps.summary.total_missing}
          turnoutPercentage={participation.dreps.summary.turnout_percentage}
          searchTerm={searchTerm}
          statusFilter={filter}
          renderItem={renderDRep}
          getSearchableValue={(participant) =>
            [
              participant.given_name,
              participant.drep_id,
              participant.view,
              participant.hex,
            ]
              .filter(Boolean)
              .join(' ')
          }
          emptyLabel="No DRep participation records match the current filters."
        />
      )}

      {(groupFilter === 'all' || groupFilter === 'pools') && (
        <ParticipationSection<StakePoolParticipation>
          title="Stake Pool Operators"
          summaryLabel="Ballots submitted"
          participants={participation.stake_pools.participants}
          summaryTotal={participation.stake_pools.summary.total_eligible}
          summaryVoted={participation.stake_pools.summary.total_voted}
          summaryMissing={participation.stake_pools.summary.total_missing}
          turnoutPercentage={participation.stake_pools.summary.turnout_percentage}
          searchTerm={searchTerm}
          statusFilter={filter}
          initialLimit={300}
          renderItem={renderStakePool}
          getSearchableValue={(participant) =>
            [participant.ticker, participant.name, participant.pool_id].filter(Boolean).join(' ')
          }
          emptyLabel="No stake pool participation records match the current filters."
        />
      )}

      {(groupFilter === 'all' || groupFilter === 'committee') && (
        <ParticipationSection<CommitteeParticipation>
          title="Constitutional Committee"
          summaryLabel="Votes recorded"
          participants={participation.committee.participants}
          summaryTotal={participation.committee.summary.total_eligible}
          summaryVoted={participation.committee.summary.total_voted}
          summaryMissing={participation.committee.summary.total_missing}
          turnoutPercentage={participation.committee.summary.turnout_percentage}
          searchTerm={searchTerm}
          statusFilter={filter}
          renderItem={renderCommitteeMember}
          getSearchableValue={(participant) =>
            [
              participant.identifier,
              participant.role,
              participant.hot_key,
              participant.cold_key,
            ]
              .filter(Boolean)
              .join(' ')
          }
          emptyLabel="No constitutional committee participation records match the current filters."
        />
      )}
    </div>
  );
}

