'use client';

import { useState, useMemo } from 'react';
import DRepCard from './DRepCard';
import { DRepCardSkeleton } from './ui/CardSkeleton';
import { Button } from './ui/Button';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import type { DRep } from '@/types/governance';
import { cn } from '@/lib/utils';

interface DRepListProps {
  dreps: DRep[];
  currentPage?: number;
  hasMore?: boolean;
  onPageChange?: (page: number) => void;
  loading?: boolean;
}

export default function DRepList({ 
  dreps, 
  currentPage = 1, 
  hasMore = false, 
  onPageChange,
  loading = false 
}: DRepListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'retired'>('all');
  const [sortBy, setSortBy] = useState<'power' | 'name'>('power');

  const filteredAndSorted = useMemo(() => {
    let filtered = dreps.filter((drep) => {
      const matchesSearch = 
        (drep.metadata?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (drep.metadata?.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        drep.drep_id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || drep.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      if (sortBy === 'power') {
        const powerA = BigInt(a.voting_power_active || a.voting_power || '0');
        const powerB = BigInt(b.voting_power_active || b.voting_power || '0');
        return powerB > powerA ? 1 : powerB < powerA ? -1 : 0;
      } else {
        const nameA = (a.metadata?.name || a.view || '').toLowerCase();
        const nameB = (b.metadata?.name || b.view || '').toLowerCase();
        return nameA.localeCompare(nameB);
      }
    });

    return filtered;
  }, [dreps, searchQuery, statusFilter, sortBy]);

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            placeholder="Search DReps..."
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
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className={cn(
              "px-4 py-2 border border-input rounded-md",
              "bg-background text-foreground",
              "focus:ring-2 focus:ring-ring focus:border-transparent"
            )}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="retired">Retired</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className={cn(
              "px-4 py-2 border border-input rounded-md",
              "bg-background text-foreground",
              "focus:ring-2 focus:ring-ring focus:border-transparent"
            )}
          >
            <option value="power">Sort by Power</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Show skeletons while loading
          Array.from({ length: 6 }).map((_, i) => (
            <DRepCardSkeleton key={i} />
          ))
        ) : filteredAndSorted.length > 0 ? (
          filteredAndSorted.map((drep) => (
            <DRepCard key={drep.drep_id} drep={drep} />
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No DReps found matching your criteria
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {onPageChange && (
        <div className="mt-8 flex items-center justify-center space-x-4">
          <Button
            variant="outline"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1 || loading}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>
          
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Page</span>
            <span className="font-semibold">{currentPage}</span>
          </div>
          
          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasMore || loading}
            className="flex items-center space-x-2"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

    </div>
  );
}

