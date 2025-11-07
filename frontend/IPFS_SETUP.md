# IPFS Metadata Upload Setup

This document explains how to use the IPFS metadata upload feature for DRep registration in GovTool.

## Overview

When registering as a DRep, you need to provide metadata about yourself following the [CIP-119](https://github.com/cardano-foundation/CIPs/blob/master/CIP-0119/README.md) standard. This metadata should be stored on IPFS (InterPlanetary File System) for permanent, decentralized storage.

## Storage Options

GovTool offers three storage options for your DRep metadata:

### 1. IPFS Upload (Recommended)

Upload your metadata to IPFS using either Pinata or Blockfrost. The application will handle the upload process and return an IPFS URL that you can use for registration.

**Supported Providers:**

- **Pinata** - User-friendly IPFS service with a generous free tier
- **Blockfrost** - Cardano-focused service with integrated IPFS support

### 2. Custom URL

If you've already uploaded your metadata elsewhere (GitHub, personal server, etc.), you can provide the URL directly.

### 3. No Metadata

Register without metadata initially. You can add it later through an update certificate.

## Setting Up IPFS Providers

### Pinata Setup

1. **Create an Account**
   - Visit <https://app.pinata.cloud/> and sign up
   - Free tier includes 1GB storage and unlimited uploads

2. **Create an API Key**
   - Go to [API Keys page](https://app.pinata.cloud/developers/keys)
   - Click "New Key" in the top right
   - For testing, use Admin privileges
   - For production, scope to "pinFileToIPFS" endpoint
   - Give it a name and click "Create Key"

3. **Copy Your JWT**
   - You'll see your API Key Info with a JWT token
   - **Important**: Copy this token immediately - it's only shown once!
   - Store it securely (password manager recommended)

4. **Use in GovTool**
   - When registering as a DRep, choose "IPFS" storage
   - Select "Pinata" as the provider
   - Paste your JWT token in the API key field
   - Click "Continue" to upload your metadata

### Blockfrost Setup

1. **Create an Account**
   - Visit <https://blockfrost.io/> and sign up
   - Free tier includes 50,000 requests per day

2. **Create an IPFS Project**
   - Go to your [Dashboard](https://blockfrost.io/dashboard)
   - Click "Add Project"
   - Select "IPFS" as the project type
   - Name your project (e.g., "GovTool DRep Metadata")

3. **Copy Your Project ID**
   - Click on your IPFS project
   - Copy the Project ID (starts with `ipfs...`)
   - Example: `ipfsEnrkKWDwlA9hV4IajI4ILrFdsHJpIqNC`

4. **Use in GovTool**
   - When registering as a DRep, choose "IPFS" storage
   - Select "Blockfrost" as the provider
   - Paste your Project ID in the API key field
   - Click "Continue" to upload your metadata

## Security Notes

- **API Keys are NOT Stored**: Your API key is only used for the upload request and is never stored by GovTool
- **Use Scoped Keys**: For production use, create API keys with minimal required permissions
- **Don't Share Keys**: Never commit API keys to version control or share them publicly
- **Rotate Keys**: Periodically rotate your API keys as a security best practice

## Metadata Structure

Your metadata will be automatically formatted according to CIP-119 standard:

```json
{
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
    "givenName": "Your Name",
    "objectives": "Your objectives...",
    "motivations": "Your motivations...",
    "qualifications": "Your qualifications...",
    "paymentAddress": "addr1...",
    "image": {
      "@type": "ImageObject",
      "contentUrl": "https://..."
    },
    "references": [
      {
        "@type": "Link",
        "label": "Twitter",
        "uri": "https://twitter.com/..."
      }
    ]
  }
}
```

## IPFS URLs

After successful upload, you'll receive:

- **IPFS URL**: `ipfs://Qm...` (CID-based URL)
- **Blake2b-256 Hash**: Used for on-chain verification
- **CID**: Content Identifier for your metadata

## Troubleshooting

### Upload Fails

- **Check API Key**: Ensure you've copied the full key correctly
- **Check Permissions**: Make sure your API key has upload permissions
- **Check Limits**: Verify you haven't exceeded your free tier limits
- **Network Issues**: Try again if there are connectivity issues

### Pinata-Specific Issues

- **Invalid JWT**: Make sure you copied the JWT token, not the API Key or Secret
- **Expired Key**: Create a new key if your old one has expired
- **File Size**: Pinata free tier has file size limits (generally 100MB+)

### Blockfrost-Specific Issues

- **Wrong Project Type**: Ensure you created an IPFS project, not a Cardano project
- **Project ID Format**: Should start with `ipfs` followed by alphanumeric characters
- **Pinning Delay**: Files may take a few minutes to be fully pinned

### Verification Failed

After upload, you can verify your metadata is accessible:

- Pinata: `https://gateway.pinata.cloud/ipfs/[YOUR_CID]`
- Blockfrost: `https://ipfs.io/ipfs/[YOUR_CID]`
- Public Gateway: `https://ipfs.io/ipfs/[YOUR_CID]`

## Alternative: Custom URL Option

If you prefer to host your metadata yourself:

1. Create your metadata JSON file following CIP-119 format
2. Upload it to:
   - GitHub repository (use raw.githubusercontent.com URL)
   - Personal web server (must be publicly accessible)
   - Another IPFS gateway
3. Calculate blake2b-256 hash (optional but recommended)
4. Use the "Custom URL" option in GovTool

## Best Practices

1. **Test First**: Use a testnet faucet address for your first registration
2. **Verify Content**: Double-check all information before uploading (IPFS is immutable)
3. **Keep Records**: Save your IPFS URL and hash for future reference
4. **Update When Needed**: You can update your metadata later by submitting an update certificate

## Resources

- [CIP-119 DRep Metadata Standard](https://github.com/cardano-foundation/CIPs/blob/master/CIP-0119/README.md)
- [CIP-100 Governance Metadata](https://github.com/cardano-foundation/CIPs/blob/master/CIP-0100/README.md)
- [Pinata Documentation](https://docs.pinata.cloud/)
- [Blockfrost IPFS Documentation](https://blockfrost.dev/start-building/ipfs/)
- [IPFS Documentation](https://docs.ipfs.io/)

## Support

If you encounter issues:

1. Check this documentation first
2. Verify your API keys are correct and have proper permissions
3. Try the alternative provider (Pinata vs Blockfrost)
4. Use the "Custom URL" option as a fallback
5. Open an issue on the GovTool repository with error details
