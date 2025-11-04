import { BrowserWallet } from '@meshsdk/core';

export type WalletName = 'nami' | 'eternl' | 'flint' | 'gero' | 'lace' | 'typhon' | 'nufi' | 'begin' | 'vespr' | 'yoroi';

export interface ConnectedWallet {
  name: WalletName;
  wallet: any;
  address: string;
  stakeAddress?: string;
}

/**
 * Get available wallets
 */
export function getAvailableWallets(): WalletName[] {
  if (typeof window === 'undefined') return [];
  
  const available: WalletName[] = [];
  
  if (window.cardano) {
    if (window.cardano.nami) available.push('nami');
    if (window.cardano.eternl) available.push('eternl');
    if (window.cardano.flint) available.push('flint');
    if (window.cardano.gero) available.push('gero');
    if (window.cardano.lace) available.push('lace');
    if (window.cardano.typhon) available.push('typhon');
    if (window.cardano.nufi) available.push('nufi');
    if (window.cardano.begin) available.push('begin');
    if (window.cardano.vespr) available.push('vespr');
    if (window.cardano.yoroi) available.push('yoroi');
  }
  
  return available;
}

/**
 * Connect to a wallet
 */
export async function connectWallet(walletName: WalletName): Promise<ConnectedWallet | null> {
  try {
    if (typeof window === 'undefined' || !window.cardano) {
      throw new Error('Cardano wallet not found');
    }

    const walletAPI = window.cardano[walletName];
    if (!walletAPI) {
      throw new Error(`Wallet ${walletName} not found`);
    }

    const wallet = await BrowserWallet.enable(walletName);
    const addresses = await wallet.getUsedAddresses();
    const address = addresses[0];
    
    // Try to get stake address
    let stakeAddress: string | undefined;
    try {
      const rewardAddresses = await wallet.getRewardAddresses();
      stakeAddress = rewardAddresses[0];
    } catch (e) {
      // Not all wallets support stake addresses
    }

    return {
      name: walletName,
      wallet,
      address,
      stakeAddress,
    };
  } catch (error) {
    console.error('Error connecting wallet:', error);
    return null;
  }
}

/**
 * Disconnect wallet
 */
export async function disconnectWallet(wallet: any): Promise<void> {
  try {
    if (wallet && typeof wallet.disconnect === 'function') {
      await wallet.disconnect();
    }
  } catch (error) {
    console.error('Error disconnecting wallet:', error);
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    cardano?: {
      [key: string]: any;
      nami?: any;
      eternl?: any;
      flint?: any;
      gero?: any;
      lace?: any;
      typhon?: any;
      nufi?: any;
      begin?: any;
      vespr?: any;
      yoroi?: any;
    };
  }
}

