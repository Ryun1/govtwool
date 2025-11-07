import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

type IpfsProvider = 'pinata' | 'blockfrost';

interface UploadRequest {
  metadata: any;
  provider: IpfsProvider;
  apiKey: string;
}

/**
 * Upload metadata JSON to IPFS using Pinata or Blockfrost
 */
export async function POST(request: NextRequest) {
  try {
    const { metadata, provider, apiKey }: UploadRequest = await request.json();

    // Validate metadata has required fields
    if (!metadata || typeof metadata !== 'object' || !metadata.body?.givenName) {
      return NextResponse.json(
        { error: 'Invalid metadata: givenName is required' },
        { status: 400 }
      );
    }

    // Validate provider and API key
    if (!provider || !apiKey) {
      return NextResponse.json(
        { error: 'Provider and API key are required' },
        { status: 400 }
      );
    }

    // Calculate blake2b-256 hash of the metadata (minified for stable hashing)
    const metadataString = JSON.stringify(metadata);
    const hash = crypto
      .createHash('blake2b512')
      .update(metadataString)
      .digest('hex')
      .slice(0, 64); // blake2b-256 is 32 bytes = 64 hex characters

    let ipfsHash: string;

    if (provider === 'pinata') {
      ipfsHash = await uploadToPinata(metadata, apiKey);
    } else if (provider === 'blockfrost') {
      ipfsHash = await uploadToBlockfrost(metadata, apiKey);
    } else {
      return NextResponse.json(
        { error: 'Invalid provider. Choose pinata or blockfrost' },
        { status: 400 }
      );
    }

    // Return IPFS URL with ipfs:// protocol
    return NextResponse.json({
      url: `ipfs://${ipfsHash}`,
      hash: hash,
      cid: ipfsHash,
    });

  } catch (error) {
    console.error('IPFS upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload to IPFS' },
      { status: 500 }
    );
  }
}

/**
 * Upload to Pinata using their API
 * Documentation: https://docs.pinata.cloud/frameworks/next-js
 */
async function uploadToPinata(metadata: any, jwt: string): Promise<string> {
  try {
    // Basic validation for JWT format to improve error feedback
    const isLikelyJwt = typeof jwt === 'string' && jwt.split('.').length === 3;
    if (!isLikelyJwt) {
      throw new Error('Expected a Pinata JWT (Bearer token). Please provide a valid JWT from Pinata Developers > Keys.');
    }

    // Convert metadata to a Blob
    const blob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
    
    // Create FormData
    const formData = new FormData();
    formData.append('file', blob, 'drep-metadata.json');
    
    // Optional: Add pinata metadata
    const pinataMetadata = JSON.stringify({
      name: `DRep Metadata - ${metadata.body.givenName}`,
    });
    formData.append('pinataMetadata', pinataMetadata);

    // Upload to Pinata
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`,
      },
      body: formData,
    });

    if (!response.ok) {
      // Try to parse JSON; fallback to text
      let message = response.statusText;
      try {
        const errorData = await response.json();
        message = errorData?.error?.message || errorData?.message || message;
      } catch {
        try {
          message = await response.text();
        } catch {
          /* noop */
        }
      }
      throw new Error(`Pinata upload failed (${response.status}): ${message}`);
    }

    const data = await response.json();
    return data.IpfsHash; // CID

  } catch (error) {
    throw new Error(`Pinata upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload to Blockfrost IPFS
 * Documentation: https://blockfrost.dev/start-building/ipfs/
 */
async function uploadToBlockfrost(metadata: any, projectId: string): Promise<string> {
  try {
    // Convert metadata to a Blob
    const blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
    
    // Create FormData
    const formData = new FormData();
    formData.append('file', blob, 'drep-metadata.json');

    // Upload to Blockfrost IPFS
    const response = await fetch('https://ipfs.blockfrost.io/api/v0/ipfs/add', {
      method: 'POST',
      headers: {
        'project_id': projectId,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Blockfrost upload failed: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    const ipfsHash = data.ipfs_hash; // CID

    // Pin the file immediately to prevent garbage collection
    const pinResponse = await fetch(`https://ipfs.blockfrost.io/api/v0/ipfs/pin/add/${ipfsHash}`, {
      method: 'POST',
      headers: {
        'project_id': projectId,
      },
    });

    if (!pinResponse.ok) {
      console.error('Warning: Failed to pin file on Blockfrost');
      // Continue anyway, file is uploaded
    }

    return ipfsHash; // CID

  } catch (error) {
    throw new Error(`Blockfrost upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
