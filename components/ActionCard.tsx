import Link from 'next/link';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Badge } from './ui/Badge';
import { Clock, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import type { GovernanceAction } from '@/types/governance';

interface ActionCardProps {
  action: GovernanceAction;
}

function getStatusIcon(status: string | undefined) {
  switch (status) {
    case 'enacted':
      return <CheckCircle className="w-4 h-4" />;
    case 'rejected':
    case 'expired':
      return <XCircle className="w-4 h-4" />;
    case 'voting':
      return <Clock className="w-4 h-4" />;
    default:
      return <TrendingUp className="w-4 h-4" />;
  }
}

function getStatusVariant(status: string | undefined): 'success' | 'warning' | 'error' | 'info' | 'default' {
  switch (status) {
    case 'enacted':
    case 'ratified':
      return 'success';
    case 'voting':
      return 'info';
    case 'rejected':
    case 'expired':
      return 'error';
    default:
      return 'default';
  }
}

function formatActionType(type: string): string {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function ActionCard({ action }: ActionCardProps) {
  const status = action.status || 'submitted';
  const title = action.metadata?.title || action.description || `Action ${action.action_id.slice(0, 8)}`;

  return (
    <Link href={`/actions/${action.action_id}`} className="block h-full">
      <Card className="h-full cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-semibold text-foreground line-clamp-2">
              {title}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{formatActionType(action.type)}</Badge>
              <Badge variant={getStatusVariant(status)} className="flex items-center gap-1">
                {getStatusIcon(status)}
                <span>{status}</span>
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-4">
          {action.metadata?.description && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {action.metadata.description}
            </p>
          )}

          {(action.voting_epoch || action.enactment_epoch) && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              {action.voting_epoch && (
                <div className="p-2 rounded-md bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Voting Epoch</p>
                  <p className="font-semibold text-foreground">{action.voting_epoch}</p>
                </div>
              )}
              {action.enactment_epoch && (
                <div className="p-2 rounded-md bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Enactment Epoch</p>
                  <p className="font-semibold text-foreground">{action.enactment_epoch}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

