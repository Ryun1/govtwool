import { NextResponse } from 'next/server';
import { getTotalActiveDReps } from '@/lib/governance';

export const revalidate = 60;

export async function GET() {
  try {
    const activeDRepsCount = await getTotalActiveDReps();
    return NextResponse.json({ activeDRepsCount });
  } catch (error) {
    console.error('Error fetching active DReps count:', error);
    return NextResponse.json({ activeDRepsCount: null }, { status: 500 });
  }
}

