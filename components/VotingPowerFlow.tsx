'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { DRep } from '@/types/governance';

interface VotingPowerFlowProps {
  dreps: DRep[];
}

export function VotingPowerFlow({ dreps }: VotingPowerFlowProps) {
  const chartData = useMemo(() => {
    // Sort DReps by voting power and take top 10
    const sorted = [...dreps]
      .filter((drep) => {
        const power = BigInt(drep.voting_power_active || drep.voting_power || '0');
        return power > 0n;
      })
      .sort((a, b) => {
        const powerA = BigInt(a.voting_power_active || a.voting_power || '0');
        const powerB = BigInt(b.voting_power_active || b.voting_power || '0');
        return powerB > powerA ? 1 : powerB < powerA ? -1 : 0;
      })
      .slice(0, 10);

    return sorted.map((drep) => {
      const power = BigInt(drep.voting_power_active || drep.voting_power || '0');
      const ada = Number(power) / 1_000_000;
      
      return {
        name: drep.metadata?.name || drep.view || drep.drep_id.slice(0, 8),
        power: ada,
        powerM: ada / 1_000_000,
      };
    });
  }, [dreps]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No voting power data available
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">Top DReps by Voting Power</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={100}
          />
          <YAxis />
          <Tooltip 
            formatter={(value: number) => {
              if (value >= 1_000_000) {
                return `${(value / 1_000_000).toFixed(2)}M ADA`;
              }
              if (value >= 1_000) {
                return `${(value / 1_000).toFixed(2)}K ADA`;
              }
              return `${value.toFixed(2)} ADA`;
            }}
          />
          <Legend />
          <Bar dataKey="power" fill="#7cb342" name="Voting Power (ADA)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

