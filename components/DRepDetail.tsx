'use client';

import { useMemo } from 'react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { VotingPowerChart } from './VotingPowerChart';
import { ExternalLink, TrendingUp, Calendar, Hash } from 'lucide-react';
import Link from 'next/link';
import type { DRep, DRepVotingHistory } from '@/types/governance';

interface DRepDetailProps {
  drep: DRep;
  votingHistory: DRepVotingHistory[];
}

function formatVotingPower(power: string | undefined): string {
  if (!power) return '0 ADA';
  const powerNum = BigInt(power);
  const ada = Number(powerNum) / 1_000_000;
  if (ada >= 1_000_000) {
    return `${(ada / 1_000_000).toFixed(2)}M ADA`;
  }
  if (ada >= 1_000) {
    return `${(ada / 1_000).toFixed(2)}K ADA`;
  }
  return `${ada.toFixed(2)} ADA`;
}

function formatVoteCount(vote: 'yes' | 'no' | 'abstain'): string {
  if (!vote) return 'Unknown';
  return vote.charAt(0).toUpperCase() + vote.slice(1);
}

export default function DRepDetail({ drep, votingHistory }: DRepDetailProps) {
  const drepName = drep.metadata?.name || drep.view || drep.drep_id.slice(0, 8);
  const status = drep.status || 'active';

  const voteStats = useMemo(() => {
    const stats = { yes: 0, no: 0, abstain: 0 };
    votingHistory.forEach((vote) => {
      if (vote.vote) {
        stats[vote.vote]++;
      }
    });
    return stats;
  }, [votingHistory]);

  const participationRate = votingHistory.length > 0 
    ? ((votingHistory.length / (votingHistory.length + 10)) * 100).toFixed(1) 
    : '0';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/dreps" className="text-field-green hover:underline mb-4 inline-block">
          ← Back to DReps
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{drepName}</h1>
                <Badge variant={status === 'active' ? 'success' : status === 'retired' ? 'error' : 'default'}>
                  {status}
                </Badge>
              </div>
            </div>

            {drep.metadata?.description && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-gray-700">{drep.metadata.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-field-green" />
                <div>
                  <p className="text-xs text-gray-500">Voting Power</p>
                  <p className="text-lg font-semibold">{formatVotingPower(drep.voting_power_active || drep.voting_power)}</p>
                </div>
              </div>
              
              {drep.registration_epoch && (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-sky-blue" />
                  <div>
                    <p className="text-xs text-gray-500">Registered Epoch</p>
                    <p className="text-lg font-semibold">{drep.registration_epoch}</p>
                  </div>
                </div>
              )}
            </div>

            {drep.metadata?.website && (
              <div className="mb-4">
                <a
                  href={drep.metadata.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-blue hover:underline flex items-center space-x-2"
                >
                  <span>Visit Website</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}

            {drep.anchor && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Anchor</p>
                <a
                  href={drep.anchor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-blue hover:underline flex items-center space-x-2"
                >
                  <span className="break-all">{drep.anchor.url}</span>
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                </a>
              </div>
            )}

            {drep.registration_tx_hash && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-1">Registration Transaction</p>
                <div className="flex items-center space-x-2">
                  <Hash className="w-4 h-4 text-gray-400" />
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">{drep.registration_tx_hash.slice(0, 16)}...</code>
                </div>
              </div>
            )}
          </Card>

          <Card className="mt-6">
            <h2 className="text-xl font-bold mb-4">Voting History</h2>
            {votingHistory.length > 0 ? (
              <div className="space-y-3">
                {votingHistory.slice(0, 10).map((vote, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium text-sm">
                        Action {vote.action_id ? `${vote.action_id.slice(0, 8)}...` : 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">Epoch {vote.epoch || 'N/A'}</p>
                    </div>
                    <Badge variant={vote.vote === 'yes' ? 'success' : vote.vote === 'no' ? 'error' : 'warning'}>
                      {vote.vote ? formatVoteCount(vote.vote) : 'Unknown'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No voting history available</p>
            )}
          </Card>
        </div>

        <div>
          <Card>
            <h2 className="text-xl font-bold mb-4">Statistics</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Participation Rate</p>
                <p className="text-2xl font-bold">{participationRate}%</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-2">Vote Distribution</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Yes</span>
                    <span className="font-semibold">{voteStats.yes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">No</span>
                    <span className="font-semibold">{voteStats.no}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Abstain</span>
                    <span className="font-semibold">{voteStats.abstain}</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Total Votes</p>
                <p className="text-2xl font-bold">{votingHistory.length}</p>
              </div>
            </div>
          </Card>

          <Link href={`/delegate?drep=${drep.drep_id}`}>
            <Button className="w-full mt-6" size="lg">
              Delegate to this DRep
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

