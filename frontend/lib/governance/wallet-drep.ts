/**
 * Wallet DRep utilities
 * 
 * Functions to derive DRep ID from stake key and check DRep registration status
 */

// Use Mesh SDK wallet.getDRep() for DRep ID derivation

/**
 * Derive DRep ID using Mesh SDK wallet.getDRep()
 * @param wallet - Mesh SDK wallet instance (must be connected)
 * @returns Promise<string | undefined> - DRep ID in CIP-105 format (drep1...)
 */
export async function getDRepIdFromWallet(wallet: any): Promise<string | undefined> {
  try {
    if (!wallet || typeof wallet.getDRep !== 'function') {
      throw new Error('wallet.getDRep() is not available');
    }
    const dRep = await wallet.getDRep();
    return dRep?.dRepIDCip105;
  } catch (error) {
    console.error('Error getting DRep ID from wallet using Mesh SDK:', error);
    return undefined;
  }
}

/**
 * Check if a wallet is registered as a DRep
 * 
 * @param drepId - DRep ID to check
 * @param apiBaseUrl - Base URL for the backend API (optional, defaults to /api)
 * @returns DRep object if registered, null if not registered
 */
export async function checkDRepRegistration(drepId: string, apiBaseUrl: string = '/api'): Promise<any | null> {
  try {
    const response = await fetch(`${apiBaseUrl}/dreps/${drepId}`);
    
    if (response.ok) {
      const drep = await response.json();
      // Check if DRep is actually registered (not retired or expired)
      if (drep.active || drep.status === 'active') {
        return drep;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error checking DRep registration:', error);
    return null;
  }
}

/**
 * Get DRep metadata
 * 
 * @param drepId - DRep ID
 * @param apiBaseUrl - Base URL for the backend API (optional, defaults to /api)
 * @returns DRep metadata if available, null otherwise
 */
export async function getDRepMetadata(drepId: string, apiBaseUrl: string = '/api'): Promise<any | null> {
  try {
    const response = await fetch(`${apiBaseUrl}/dreps/${drepId}/metadata`);
    
    if (response.ok) {
      const metadata = await response.json();
      return metadata;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching DRep metadata:', error);
    return null;
  }
}

/**
 * Get wallet's delegation target
 * 
 * This queries the wallet's stake address to determine which DRep it's delegated to.
 * 
 * @param stakeAddress - Stake address
 * @param connectedWallet - Connected wallet instance (optional, for wallet API access)
 * @returns DRep ID that the stake address is delegated to, or null if not delegated
 */
export async function getWalletDelegation(
  stakeAddress: string, 
  connectedWallet?: any
): Promise<string | null> {
  try {
    // Try wallet API first (if wallet supports governance)
    if (connectedWallet?.wallet) {
      try {
        // Some wallets may support getting delegation info
        // This is wallet-specific and may not be available
        const wallet = connectedWallet.wallet;
        
        // Check if wallet has governance methods (CIP-95)
        if (typeof wallet.cip95 !== 'undefined') {
          // Attempt to get governance delegation
          // Note: This API may vary by wallet implementation
          console.log('[wallet-drep] Wallet has CIP-95 support, but delegation query not implemented');
        }
      } catch (error) {
        console.warn('[wallet-drep] Wallet API delegation query failed:', error);
      }
    }

    // Query frontend API endpoint (which will implement backend/blockchain query)
    const response = await fetch(`/api/stake/${stakeAddress}/delegation`);
    if (response.ok) {
      const data = await response.json();
      if (data.delegated && data.drep_id) {
        return data.drep_id;
      }
    }

    return null;
  } catch (error) {
    console.error('[wallet-drep] Error getting wallet delegation:', error);
    return null;
  }
}
