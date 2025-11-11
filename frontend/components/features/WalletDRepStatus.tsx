'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle2, XCircle, ExternalLink, User, AlertCircle } from 'lucide-react';
import {
  getDRepIdFromWallet,
  checkDRepRegistration,
  getDRepMetadata,
  getWalletDelegation,
  type DRepMetadataResponse,
} from '@/lib/governance/wallet-drep';
import type { DRep } from '@/types/governance';
import type { ConnectedWallet } from '@/lib/api/mesh';
import Link from 'next/link';

interface WalletDRepStatusProps {
  stakeAddress: string;
  connectedWallet?: ConnectedWallet;
}

export default function WalletDRepStatus({ stakeAddress, connectedWallet }: WalletDRepStatusProps) {
  const [loading, setLoading] = useState(true);
  const [drepId, setDrepId] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [drepInfo, setDrepInfo] = useState<DRep | null>(null);
  const [metadata, setMetadata] = useState<DRepMetadataResponse['json_metadata'] | null>(null);
  const [delegatedTo, setDelegatedTo] = useState<string | null>(null);
  const [delegatedDRepInfo, setDelegatedDRepInfo] = useState<DRep | null>(null);
  const [delegatedDRepMetadata, setDelegatedDRepMetadata] = useState<DRepMetadataResponse['json_metadata'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [delegationLoading, setDelegationLoading] = useState(true);

  useEffect(() => {
    async function checkStatus() {
      setLoading(true);
      setError(null);

      try {
        // Get DRep ID using Mesh SDK wallet.getDRep()
        let drepIdFromWallet: string | undefined = undefined;
        if (connectedWallet && connectedWallet.wallet) {
          drepIdFromWallet = await getDRepIdFromWallet(connectedWallet.wallet);
        }
        setDrepId(drepIdFromWallet || null);

        // Check if registered as DRep
        if (drepIdFromWallet) {
          const drepData = await checkDRepRegistration(drepIdFromWallet);
          if (drepData) {
            setIsRegistered(true);
            setDrepInfo(drepData);

            // Fetch metadata if available
            const metadataData = await getDRepMetadata(drepIdFromWallet);
            if (metadataData && metadataData.json_metadata) {
              setMetadata(metadataData.json_metadata);
            }
          } else {
            setIsRegistered(false);
          }
        } else {
          setIsRegistered(false);
        }

        // Get delegation target
        setDelegationLoading(true);
        const delegation = await getWalletDelegation(stakeAddress, connectedWallet);
        if (delegation) {
          setDelegatedTo(delegation);
          
          // Fetch delegated DRep info and metadata
          const delegatedDRepData = await checkDRepRegistration(delegation);
          if (delegatedDRepData) {
            setDelegatedDRepInfo(delegatedDRepData);
            
            const delegatedMetadata = await getDRepMetadata(delegation);
            if (delegatedMetadata && delegatedMetadata.json_metadata) {
              setDelegatedDRepMetadata(delegatedMetadata.json_metadata);
            }
          }
        }
        setDelegationLoading(false);

      } catch (err) {
        console.error('Error checking wallet DRep status:', err);
        setError(err instanceof Error ? err.message : 'Failed to check DRep status');
      } finally {
        setLoading(false);
      }
    }

    if (stakeAddress) {
      checkStatus();
    }
  }, [stakeAddress, connectedWallet]);

  if (loading) {
    return (
      <Card className="p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 mb-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <XCircle className="h-5 w-5" />
          <span className="font-medium">Error checking DRep status</span>
        </div>
        <p className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Your Wallet Status</h2>
      
      <div className="space-y-4">
        {/* DRep Registration Status */}
        <div className="flex items-start gap-3">
          {isRegistered ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
          ) : (
            <XCircle className="h-5 w-5 text-gray-400 dark:text-gray-600 mt-0.5 flex-shrink-0" />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold">DRep Registration</span>
              {isRegistered ? (
                <Badge variant="success">Registered</Badge>
              ) : (
                <Badge variant="secondary">Not Registered</Badge>
              )}
            </div>
            
            {drepId && (
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                <span className="font-mono text-xs break-all">{drepId}</span>
                {isRegistered && (
                  <Link 
                    href={`/dreps/${drepId}`}
                    className="ml-2 inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View Profile
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>
            )}

            {isRegistered && drepInfo && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {metadata?.body?.givenName && (
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{metadata.body.givenName}</span>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <span className="ml-2 font-medium capitalize">{drepInfo.status || 'Active'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Voting Power:</span>
                    <span className="ml-2 font-medium">
                      {drepInfo.voting_power_active 
                        ? `${(parseInt(drepInfo.voting_power_active) / 1_000_000).toFixed(0)} ₳`
                        : '0 ₳'
                      }
                    </span>
                  </div>
                  {drepInfo.delegator_count !== undefined && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Delegators:</span>
                      <span className="ml-2 font-medium">{drepInfo.delegator_count}</span>
                    </div>
                  )}
                  {drepInfo.vote_count !== undefined && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Votes Cast:</span>
                      <span className="ml-2 font-medium">{drepInfo.vote_count}</span>
                    </div>
                  )}
                </div>

                {metadata?.body?.objectives && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Objectives:</span>
                    <p className="text-sm mt-1 line-clamp-2">{metadata.body.objectives}</p>
                  </div>
                )}
              </div>
            )}

            {!isRegistered && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                You can register as a DRep using the &quot;Register as DRep&quot; tab below.
              </p>
            )}
          </div>
        </div>

        {/* Delegation Status */}
        <div className="flex items-start gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <User className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold">Delegation Status</span>
              {delegationLoading ? (
                <Badge variant="secondary">Loading...</Badge>
              ) : delegatedTo ? (
                <Badge variant="info">Delegated</Badge>
              ) : (
                <Badge variant="secondary">Not Delegated</Badge>
              )}
            </div>
            
            {delegationLoading ? (
              <div className="mt-2">
                <div className="animate-pulse space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ) : delegatedTo ? (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Delegated to:</span>
                  <Link 
                    href={`/dreps/${delegatedTo}`}
                    className="font-mono text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                  >
                    {delegatedTo.slice(0, 20)}...{delegatedTo.slice(-10)}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>

                {delegatedDRepInfo && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    {delegatedDRepMetadata?.body?.givenName && (
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="font-medium text-blue-900 dark:text-blue-100">
                          {delegatedDRepMetadata.body.givenName}
                        </span>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Status:</span>
                        <span className="ml-2 font-medium capitalize">
                          {delegatedDRepInfo.status || 'Active'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Voting Power:</span>
                        <span className="ml-2 font-medium">
                          {delegatedDRepInfo.voting_power_active 
                            ? `${(parseInt(delegatedDRepInfo.voting_power_active) / 1_000_000).toFixed(0)} ₳`
                            : '0 ₳'
                          }
                        </span>
                      </div>
                      {delegatedDRepInfo.vote_count !== undefined && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Votes Cast:</span>
                          <span className="ml-2 font-medium">{delegatedDRepInfo.vote_count}</span>
                        </div>
                      )}
                      {delegatedDRepInfo.delegator_count !== undefined && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Total Delegators:</span>
                          <span className="ml-2 font-medium">{delegatedDRepInfo.delegator_count}</span>
                        </div>
                      )}
                    </div>

                    {delegatedDRepMetadata?.body?.objectives && (
                      <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Objectives:</span>
                        <p className="text-sm mt-1 line-clamp-2 text-gray-700 dark:text-gray-300">
                          {delegatedDRepMetadata.body.objectives}
                        </p>
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                      <Link
                        href={`/dreps/${delegatedTo}`}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                      >
                        View Full DRep Profile
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                )}

                {!delegatedDRepInfo && (
                  <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">Unable to load delegated DRep information</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-2">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  You haven&apos;t delegated your voting power yet.
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Use the &quot;Delegate&quot; tab below to delegate your voting power to a DRep of your choice.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Stake Address Info */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-gray-500">Stake Address:</span>
          <p className="text-xs font-mono text-gray-600 dark:text-gray-400 mt-1 break-all">
            {stakeAddress}
          </p>
        </div>
      </div>
    </Card>
  );
}
