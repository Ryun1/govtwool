'use client';

import { useState, useMemo } from 'react';
import ActionCard from './ActionCard';
import { ActionCardSkeleton } from './ui/CardSkeleton';
import { Search, Filter } from 'lucide-react';
import type { GovernanceAction } from '@/types/governance';
import { cn } from '@/lib/utils';

interface ActionListProps {
  actions: GovernanceAction[];
  loading?: boolean;
}

export default function ActionList({ actions, loading = false }: ActionListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    return actions.filter((action) => {
      const matchesSearch = 
        (action.metadata?.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (action.metadata?.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        action.action_id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || action.status === statusFilter;
      const matchesType = typeFilter === 'all' || action.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [actions, searchQuery, statusFilter, typeFilter]);

  const statuses = ['all', 'submitted', 'voting', 'ratified', 'enacted', 'expired', 'rejected'];
  const types = ['all', 'parameter_change', 'hard_fork_initiation', 'treasury_withdrawals', 'no_confidence', 'update_committee', 'new_committee', 'info'];

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            placeholder="Search actions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full pl-10 pr-4 py-2 border border-input rounded-md",
              "bg-background text-foreground",
              "focus:ring-2 focus:ring-ring focus:border-transparent",
              "placeholder:text-muted-foreground"
            )}
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={cn(
              "px-4 py-2 border border-input rounded-md",
              "bg-background text-foreground",
              "focus:ring-2 focus:ring-ring focus:border-transparent"
            )}
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={cn(
              "px-4 py-2 border border-input rounded-md",
              "bg-background text-foreground",
              "focus:ring-2 focus:ring-ring focus:border-transparent"
            )}
          >
            {types.map((type) => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Show skeletons while loading
          Array.from({ length: 6 }).map((_, i) => (
            <ActionCardSkeleton key={i} />
          ))
        ) : filtered.length > 0 ? (
          filtered.map((action) => (
            <ActionCard key={action.action_id} action={action} />
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No actions found matching your criteria
          </div>
        )}
      </div>
    </div>
  );
}

