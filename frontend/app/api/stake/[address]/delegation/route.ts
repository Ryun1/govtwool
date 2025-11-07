import { NextRequest, NextResponse } from 'next/server';

/**
 * Get the DRep delegation target for a stake address
 * 
 * This endpoint queries the blockchain to find which DRep (if any) 
 * a stake address has delegated their voting power to.
 * 
 * @route GET /api/stake/:address/delegation
 * @param address - Stake address (stake1...)
 * @returns DRep ID that the stake address is delegated to, or null
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ address: string }> }
) {
  try {
    const { address: stakeAddress } = await context.params;

    // Validate stake address format
    if (!stakeAddress || !stakeAddress.startsWith('stake')) {
      return NextResponse.json(
        { error: 'Invalid stake address format' },
        { status: 400 }
      );
    }

    // TODO: Implement delegation query
    // 
    // RECOMMENDED IMPLEMENTATION:
    // Add a backend endpoint: GET /api/stake/:stakeAddress/delegation
    // This keeps API keys secure and provides better caching
    // 
    // Backend implementation (in Rust):
    // 1. Add new endpoint in backend/src/api/dreps.rs or create backend/src/api/stake.rs
    // 2. Query Blockfrost: GET /accounts/:stake_address
    //    - Response includes `drep_id` field if delegated
    // 3. Or query Koios: POST /account_info with {"_stake_addresses": ["stake1..."]}
    //    - Response includes `delegated_drep` field if delegated
    // 4. Return { stake_address, drep_id, delegated: bool }
    //
    // Then use it here:
    // const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://govtwool-backend.onrender.com';
    // const response = await fetch(`${backendUrl}/api/stake/${stakeAddress}/delegation`);
    // if (response.ok) {
    //   const data = await response.json();
    //   return NextResponse.json(data);
    // }
    //
    // ALTERNATIVE: Direct Blockfrost query from frontend (not recommended for production)
    // const blockfrostKey = process.env.BLOCKFROST_API_KEY;
    // const blockfrostNetwork = process.env.BLOCKFROST_NETWORK || 'mainnet';
    // const blockfrostUrl = `https://cardano-${blockfrostNetwork}.blockfrost.io/api/v0`;
    // 
    // const response = await fetch(
    //   `${blockfrostUrl}/accounts/${stakeAddress}`,
    //   { headers: { 'project_id': blockfrostKey! } }
    // );
    // 
    // if (response.ok) {
    //   const accountInfo = await response.json();
    //   if (accountInfo.drep_id) {
    //     return NextResponse.json({
    //       stake_address: stakeAddress,
    //       drep_id: accountInfo.drep_id,
    //       delegated: true,
    //     });
    //   }
    // }

    // Placeholder response - no delegation found
    return NextResponse.json({
      stake_address: stakeAddress,
      drep_id: null,
      delegated: false,
      message: 'Delegation query not yet implemented. Please implement one of the options in the route handler.',
    });

  } catch (error) {
    console.error('Error querying stake address delegation:', error);
    return NextResponse.json(
      { 
        error: 'Failed to query delegation status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
