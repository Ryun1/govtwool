import Link from 'next/link';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Badge } from './ui/Badge';
import { Users, TrendingUp, ExternalLink } from 'lucide-react';
import type { DRep } from '@/types/governance';
import { cn } from '@/lib/utils';

interface DRepCardProps {
  drep: DRep;
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

export default function DRepCard({ drep }: DRepCardProps) {
  const drepName = drep.metadata?.name || drep.view || drep.drep_id.slice(0, 8);
  const status = drep.status || 'active';

  return (
    <Link href={`/dreps/${drep.drep_id}`} className="block h-full">
      <Card className="h-full cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-foreground mb-1.5 truncate">
                {drepName}
              </h3>
              {drep.metadata?.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {drep.metadata.description}
                </p>
              )}
            </div>
            <Badge 
              variant={status === 'active' ? 'success' : status === 'retired' ? 'error' : 'default'}
              className="shrink-0"
            >
              {status}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-2.5 p-2 rounded-md bg-muted/50">
              <div className="p-1.5 rounded-md bg-field-green/10">
                <TrendingUp className="w-4 h-4 text-field-green" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Voting Power</p>
                <p className="text-sm font-semibold text-foreground truncate">
                  {formatVotingPower(drep.voting_power_active || drep.voting_power)}
                </p>
              </div>
            </div>
            {drep.metadata?.website && (
              <div className="flex items-center gap-2.5 p-2 rounded-md bg-muted/50">
                <div className="p-1.5 rounded-md bg-sky-blue/10">
                  <Users className="w-4 h-4 text-sky-blue" />
                </div>
                <a
                  href={drep.metadata.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary hover:underline flex items-center gap-1 truncate"
                  onClick={(e) => e.stopPropagation()}
                >
                  Website
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

