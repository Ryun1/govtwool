import type { ConnectedWallet } from '@/lib/api/mesh';
import { getFile, hashDrepAnchor, KoiosProvider, MeshTxBuilder } from '@meshsdk/core';

export interface DRepRegistrationData {
  metadataUrl?: string;
  anchorUrl?: string;
  anchorHash?: string;
}

async function getMeshJsonHash(url: string) {
  var drepAnchor = getFile(url);
  const anchorObj = JSON.parse(drepAnchor);
  return hashDrepAnchor(anchorObj);
}

const anchorUrl = "https://meshjs.dev/governance/meshjs.jsonld";

/**
 * Build and submit a DRep registration transaction
 * @throws Error if wallet does not support CIP-95
 */
export async function submitDRepRegistrationTransaction(
  wallet: ConnectedWallet,
  registrationData: DRepRegistrationData
): Promise<string> {
  // Get DRep ID from wallet
  const dRep = await wallet.wallet.getDRep();
  const dRepId = dRep.dRepIDCip105;
  console.log('Drep id ',dRepId)

  // Prepare anchor hash (only if anchorUrl is provided)
  let anchorHash = registrationData.anchorHash;
  if (registrationData.anchorUrl && !anchorHash) {
    anchorHash = await getMeshJsonHash(anchorUrl);
  }

  // Get UTXOs and change address
  const utxos = await wallet.wallet.getUtxos();
  const changeAddress = await wallet.wallet.getChangeAddress();
  console.log('Utxo',utxos);
  console.log('address',changeAddress)
    // Get network from wallet
    const networkId = await wallet.wallet.getNetworkId();
    let koiosNetwork: 'api' | 'preview' | 'preprod' | 'guild';
    switch (networkId) {
      case 0:
        koiosNetwork = 'preview'; // testnet
        break;
      case 1:
      default:
        koiosNetwork = 'api'; // mainnet (default)
        break;
    }

    // Ensure Koios API key is defined
    const koiosApiKey = process.env.NEXT_PUBLIC_KOIOS_API_KEY;
    
    if (!koiosApiKey) {
      throw new Error('Koios API key is not set. Please define NEXT_PUBLIC_KOIOS_API_KEY in your environment variables.');
    }

    // Build transaction using MeshTxBuilder and KoiosProvider
    const provider = new KoiosProvider(
      koiosNetwork,
      koiosApiKey
    );
    const txBuilder = new MeshTxBuilder({ fetcher: provider, verbose: true });
    console.log('txBuilder',txBuilder);
  // Only include anchor fields if both are valid
  const certOptions: any = {};
  if (registrationData.anchorUrl && registrationData.anchorHash) {
    txBuilder
    .drepRegistrationCertificate(dRepId, {
      anchorUrl: registrationData.anchorUrl,
      anchorDataHash: registrationData.anchorHash,
    })
    .changeAddress(changeAddress)
    .selectUtxosFrom(utxos);
    }
  // Do NOT add an 'anchor' property if either is missing

  txBuilder.drepRegistrationCertificate(dRepId)
    .changeAddress(changeAddress)
    .selectUtxosFrom(utxos);

  // Build, sign, and submit
  const unsignedTx = await txBuilder.complete();
  const signedTx = await wallet.wallet.signTx(unsignedTx);
  const txHash = await wallet.wallet.submitTx(signedTx);
  return txHash;
}

