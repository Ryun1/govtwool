import { getDRep, getDRepVotingHistory } from '@/lib/governance';
import DRepDetail from '@/components/DRepDetail';
import { notFound } from 'next/navigation';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ drepId: string }>;
}

export default async function DRepDetailPage({ params }: PageProps) {
  const { drepId } = await params;
  const drep = await getDRep(drepId);
  const votingHistory = await getDRepVotingHistory(drepId);

  if (!drep) {
    notFound();
  }

  return <DRepDetail drep={drep} votingHistory={votingHistory} />;
}

