import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// TODO: Replace with actual IPFS service integration
// Options:
// 1. NMKR IPFS API: https://studio-api.nmkr.io/v2/UploadToIpfs
// 2. Pinata: https://www.pinata.cloud/
// 3. Web3.Storage: https://web3.storage/
// 4. NFT.Storage: https://nft.storage/

export async function POST(request: NextRequest) {
  try {
    const metadata = await request.json();

    // Validate metadata has required fields
    if (!metadata.body?.givenName) {
      return NextResponse.json(
        { error: 'Invalid metadata: givenName is required' },
        { status: 400 }
      );
    }

    // Calculate blake2b-256 hash of the metadata
    const metadataString = JSON.stringify(metadata);
    const hash = crypto
      .createHash('blake2b512')
      .update(metadataString)
      .digest('hex')
      .slice(0, 64); // blake2b-256 is 32 bytes = 64 hex characters

    // TODO: Implement actual IPFS upload
    // Example with NMKR:
    // const response = await fetch('https://studio-api.nmkr.io/v2/UploadToIpfs', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${process.env.NMKR_API_KEY}`,
    //   },
    //   body: JSON.stringify(metadata),
    // });
    // const result = await response.json();
    // return NextResponse.json({
    //   url: result.ipfsUrl, // e.g., ipfs://QmHash or https://ipfs.io/ipfs/QmHash
    //   hash: hash,
    // });

    // For now, return a mock response
    // In production, this should upload to IPFS and return the actual IPFS URL
    return NextResponse.json({
      error: 'IPFS upload not configured. Please set up IPFS service (NMKR, Pinata, Web3.Storage, etc.)',
      message: 'You can use the "Custom URL" option to provide your own hosted metadata URL',
      hash: hash,
    }, { status: 501 }); // 501 Not Implemented

  } catch (error) {
    console.error('IPFS upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload to IPFS' },
      { status: 500 }
    );
  }
}
