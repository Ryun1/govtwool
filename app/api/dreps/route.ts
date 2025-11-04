import { NextResponse } from 'next/server';
import { getDRepsPage } from '@/lib/governance';

export const revalidate = 60;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const count = parseInt(searchParams.get('count') || '20', 10);
    
    const result = await getDRepsPage(page, count);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching DReps:', error);
    return NextResponse.json({ error: 'Failed to fetch DReps' }, { status: 500 });
  }
}
