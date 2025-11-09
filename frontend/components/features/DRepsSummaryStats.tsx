'use client';

import { Card, CardContent } from '../ui/Card';
import { Users, TrendingUp, Vote, Activity } from 'lucide-react';
import type { DRep, DRepStatsSummary } from '@/types/governance';

interface DRepsSummaryStatsProps {
  dreps: DRep[];
  summaryStats?: DRepStatsSummary;
}

const parseLovelace = (value?: string | null): bigint | null => {
  if (!value) {
    return null;
  }
  try {
    return BigInt(value);
  } catch {
    return null;
  }
};

const fallbackTopDRep = (dreps: DRep[]) => {
  return dreps.reduce<{ name: string; power: bigint } | null>((accumulator, drep) => {
    const candidatePower =
      parseLovelace(drep.amount) ??
      parseLovelace(drep.voting_power_active) ??
      parseLovelace(drep.voting_power);

    if (!candidatePower) {
      return accumulator;
    }

    if (!accumulator || candidatePower > accumulator.power) {
      const fallbackName =
        drep.given_name ||
        drep.metadata?.name ||
        drep.view ||
        `${drep.drep_id.slice(0, 8)}…`;
      return { name: fallbackName, power: candidatePower };
    }

    return accumulator;
  }, null);
};

export function DRepsSummaryStats({ dreps, summaryStats }: DRepsSummaryStatsProps) {
  const totalFromStats = summaryStats?.total_dreps_count ?? null;
  const total = typeof totalFromStats === 'number' ? totalFromStats : dreps.length;

  const activeFromStats = summaryStats?.active_dreps_count ?? null;
  const fallbackActiveCount = dreps.filter((d) => {
    if (d.active !== undefined) {
      return d.active && !d.retired;
    }
    return d.status === 'active';
  }).length;

  const stats = {
    total,
    active: typeof activeFromStats === 'number' ? activeFromStats : fallbackActiveCount,
    totalVotingPower: parseLovelace(summaryStats?.total_voting_power),
    topDRep:
      summaryStats?.top_drep?.drep_id
        ? {
            name:
              summaryStats.top_drep.name ||
              summaryStats.top_drep.drep_id.slice(0, 8).concat('…'),
            power: parseLovelace(summaryStats.top_drep.voting_power),
          }
        : null,
  };

  if (!stats.topDRep) {
    const fallbackTop = fallbackTopDRep(dreps);
    if (fallbackTop) {
      stats.topDRep = fallbackTop;
    }
  }

  const formatADA = (lovelace: bigint): string => {
    const ada = Number(lovelace) / 1_000_000;
    if (ada >= 1_000_000) {
      return `${(ada / 1_000_000).toFixed(2)}M ₳`;
    }
    if (ada >= 1_000) {
      return `${(ada / 1_000).toFixed(2)}K ₳`;
    }
    return `${ada.toFixed(2)} ₳`;
  };

  const statCards = [
    {
      label: 'Total DReps',
      value: stats.total.toLocaleString(),
      icon: <Users className="w-5 h-5" />,
      color: 'text-field-green',
    },
    {
      label: 'Active DReps',
      value: stats.active.toLocaleString(),
      icon: <Activity className="w-5 h-5" />,
      color: 'text-sky-blue',
    },
    {
      label: 'Total Voting Power',
      value: stats.totalVotingPower ? formatADA(stats.totalVotingPower) : 'N/A',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-field-dark',
    },
    {
      label: 'Top Voting Power',
      value: stats.topDRep?.power ? formatADA(stats.topDRep.power) : 'N/A',
      description: stats.topDRep?.name ?? 'Unavailable',
      icon: <Vote className="w-5 h-5" />,
      color: 'text-field-green',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statCards.map((stat, index) => (
        <Card key={index} className="hover:shadow-card-hover transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                {stat.description && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">{stat.description}</p>
                )}
              </div>
              <div className={`p-3 rounded-lg bg-muted/50 ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

