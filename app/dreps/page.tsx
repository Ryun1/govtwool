'use client';

import { useState, useEffect } from 'react';
import DRepList from '@/components/DRepList';
import { VotingPowerFlow } from '@/components/VotingPowerFlow';
import type { DRep } from '@/types/governance';

export default function DRepsPage() {
  const [dreps, setDReps] = useState<DRep[]>([]);
  const [allDReps, setAllDReps] = useState<DRep[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const itemsPerPage = 20;

  useEffect(() => {
    async function loadDReps() {
      setLoading(true);
      try {
        const response = await fetch(`/api/dreps?page=${currentPage}&count=${itemsPerPage}`);
        if (response.ok) {
          const data = await response.json();
          setDReps(data.dreps);
          setHasMore(data.hasMore);
          
          // For the voting power chart, we'll load a sample (first page)
          if (currentPage === 1) {
            setAllDReps(data.dreps);
          }
        } else {
          console.error('Failed to fetch DReps');
        }
      } catch (error) {
        console.error('Error loading DReps:', error);
      } finally {
        setLoading(false);
      }
    }
    loadDReps();
  }, [currentPage]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-display font-bold text-foreground mb-8">DReps Directory</h1>
      {allDReps.length > 0 && (
        <div className="mb-8">
          <VotingPowerFlow dreps={allDReps} />
        </div>
      )}
      <DRepList 
        dreps={dreps} 
        currentPage={currentPage}
        hasMore={hasMore}
        onPageChange={setCurrentPage}
        loading={loading && currentPage === 1}
      />
    </div>
  );
}

