# IPFS DRep Metadata Upload Implementation Summary

## Overview

This document summarizes the implementation of IPFS metadata pinning for DRep registration with support for Pinata and Blockfrost providers.

## Changes Made

### 1. Updated `DRepMetadataForm.tsx`

**Location**: `frontend/components/features/DRepMetadataForm.tsx`

**Changes**:

- Added `IpfsProvider` type for 'pinata' | 'blockfrost'
- Added state for IPFS provider selection (`ipfsProvider`)
- Added state for API key input (`ipfsApiKey`)
- Updated IPFS storage option description
- Added provider selection dropdown in storage configuration
- Added API key input field with provider-specific placeholders
- Added helpful links to Pinata and Blockfrost dashboards
- Updated `uploadToIpfs()` to send provider and API key to backend
- Added validation for API key before upload

**User Flow**:

1. User fills in DRep metadata fields
2. User clicks "Next: Storage"
3. User selects "IPFS" option
4. User chooses provider (Pinata or Blockfrost)
5. User enters their API key
6. User clicks "Continue"
7. Metadata is uploaded to IPFS
8. User receives IPFS URL and hash for registration

### 2. Updated `route.ts` (IPFS Upload API)

**Location**: `frontend/app/api/ipfs/upload/route.ts`

**Changes**:

- Complete rewrite of the upload endpoint
- Added `UploadRequest` interface with provider and apiKey
- Implemented `uploadToPinata()` function
  - Uses Pinata's `/pinning/pinFileToIPFS` endpoint
  - Converts JSON metadata to Blob
  - Uses FormData for upload
  - Includes pinata metadata (name) for better organization
- Implemented `uploadToBlockfrost()` function
  - Uses Blockfrost's `/api/v0/ipfs/add` endpoint
  - Automatically pins file after upload to prevent garbage collection
  - Handles both upload and pinning in one flow
- Returns standardized response with:
  - `url`: IPFS URL in `ipfs://` format
  - `hash`: blake2b-256 hash of metadata
  - `cid`: IPFS Content Identifier

**API Request Format**:

```json
{
  "metadata": {
    "@context": { ... },
    "hashAlgorithm": "blake2b-256",
    "body": { ... }
  },
  "provider": "pinata" | "blockfrost",
  "apiKey": "your-api-key-here"
}
```

**API Response Format**:

```json
{
  "url": "ipfs://QmHash...",
  "hash": "blake2b256hash...",
  "cid": "QmHash..."
}
```

### 3. Documentation

**Created Files**:

- `frontend/IPFS_SETUP.md` - Comprehensive user guide for setting up IPFS providers
- `frontend/IPFS_IMPLEMENTATION_SUMMARY.md` - This file

**Updated Files**:

- `frontend/ENV_VARIABLES.md` - Added documentation for IPFS provider API keys

## Technical Details

### Pinata Integration

**Endpoint**: `https://api.pinata.cloud/pinning/pinFileToIPFS`

**Authentication**: Bearer token (JWT)

**Process**:

1. Convert metadata JSON to Blob
2. Create FormData with file and pinata metadata
3. POST to Pinata API with JWT in Authorization header
4. Receive IpfsHash (CID) in response
5. Return formatted IPFS URL

**Documentation**: <https://docs.pinata.cloud/frameworks/next-js>

### Blockfrost Integration

**Endpoints**:

- Upload: `https://ipfs.blockfrost.io/api/v0/ipfs/add`
- Pin: `https://ipfs.blockfrost.io/api/v0/ipfs/pin/add/{ipfs_hash}`

**Authentication**: Project ID in `project_id` header

**Process**:

1. Convert metadata JSON to Blob
2. Create FormData with file
3. POST to Blockfrost IPFS add endpoint with project_id header
4. Receive ipfs_hash (CID) in response
5. Immediately PIN the file to prevent garbage collection
6. Return formatted IPFS URL

**Documentation**: <https://blockfrost.dev/start-building/ipfs/>

### Security Considerations

1. **API Keys Not Stored**: API keys are only used in the upload request and never persisted
2. **Server-Side Upload**: Upload happens on the Next.js API route (server-side) keeping keys secure
3. **No Client Exposure**: API keys are never exposed to the browser
4. **Input Validation**: Validates provider, API key, and metadata structure
5. **Error Handling**: Comprehensive error messages without exposing sensitive information

## Testing Checklist

- [ ] Test Pinata upload with valid JWT
- [ ] Test Pinata upload with invalid JWT (error handling)
- [ ] Test Blockfrost upload with valid project ID
- [ ] Test Blockfrost upload with invalid project ID (error handling)
- [ ] Test with missing API key (validation)
- [ ] Test with invalid metadata structure (validation)
- [ ] Verify IPFS URL is accessible after upload
- [ ] Verify blake2b-256 hash is calculated correctly
- [ ] Test switching between providers
- [ ] Test Custom URL option still works
- [ ] Test "No Metadata" option still works

## Future Enhancements

Potential improvements for future versions:

1. **Provider Auto-Detection**: If user has env variables set, pre-select provider
2. **Metadata Preview**: Show formatted JSON before upload
3. **Gateway Preview**: Show metadata content from IPFS gateway after upload
4. **Retry Logic**: Auto-retry failed uploads with exponential backoff
5. **Progress Indicator**: More detailed upload progress
6. **Multiple File Support**: Support uploading referenced files (images, etc.)
7. **Metadata Validation**: More comprehensive CIP-119 validation
8. **Cost Estimation**: Show estimated costs for different providers
9. **Batch Upload**: Support uploading multiple DRep metadata files
10. **Local Caching**: Cache uploaded CIDs to avoid duplicate uploads

## Usage Example

### For Users

1. **Get API Key**:
   - Pinata: Visit <https://app.pinata.cloud/developers/keys> and create a new key
   - Blockfrost: Visit <https://blockfrost.io/dashboard> and create an IPFS project

2. **Register as DRep**:
   - Go to "Register as DRep" page
   - Fill in your metadata (name, objectives, etc.)
   - Click "Next: Storage"
   - Select "IPFS (Recommended)"
   - Choose your provider (Pinata or Blockfrost)
   - Enter your API key
   - Click "Continue"
   - Wait for upload to complete
   - Use the returned IPFS URL in your registration transaction

### For Developers

See `frontend/IPFS_SETUP.md` for detailed setup instructions.

## API Testing

You can test the API directly:

```bash
curl -X POST http://localhost:3000/api/ipfs/upload \
  -H "Content-Type: application/json" \
  -d '{
    "metadata": {
      "@context": {
        "@language": "en-us",
        "CIP100": "https://github.com/cardano-foundation/CIPs/blob/master/CIP-0100/README.md#",
        "CIP119": "https://github.com/cardano-foundation/CIPs/blob/master/CIP-0119/README.md#",
        "hashAlgorithm": "CIP100:hashAlgorithm",
        "body": {
          "@id": "CIP119:body",
          "references": {
            "@id": "CIP100:references"
          }
        }
      },
      "hashAlgorithm": "blake2b-256",
      "body": {
        "givenName": "Test DRep"
      }
    },
    "provider": "pinata",
    "apiKey": "your-jwt-token"
  }'
```

## References

- [CIP-119: Governance Metadata - DRep](https://github.com/cardano-foundation/CIPs/blob/master/CIP-0119/README.md)
- [CIP-100: Governance Metadata](https://github.com/cardano-foundation/CIPs/blob/master/CIP-0100/README.md)
- [Pinata Documentation](https://docs.pinata.cloud/)
- [Blockfrost IPFS Documentation](https://blockfrost.dev/start-building/ipfs/)
- [IPFS Documentation](https://docs.ipfs.io/)

## Support

For issues or questions:

1. Check the error message returned by the API
2. Verify your API key is valid and has correct permissions
3. Try the alternative provider
4. Check the documentation links above
5. Open an issue on the repository with reproduction steps
