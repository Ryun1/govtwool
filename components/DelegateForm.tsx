'use client';

import { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { TransactionModal } from './TransactionModal';
import { useWalletContext } from './WalletProvider';
import { useTransaction } from '@/hooks/useTransaction';
import { submitDelegationTransaction } from '@/lib/transactions/delegate';
import { Search } from 'lucide-react';
import type { DRep } from '@/types/governance';

interface DelegateFormProps {
  dreps: DRep[];
  hasMore?: boolean;
  onLoadMore?: () => void;
  loading?: boolean;
}

export default function DelegateForm({ dreps, hasMore, onLoadMore, loading }: DelegateFormProps) {
  const { connectedWallet } = useWalletContext();
  const { state, reset, setBuilding, setSigning, setSubmitting, setTxHash, setError } = useTransaction();
  const [selectedDRep, setSelectedDRep] = useState<DRep | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Get DRep from URL params if present
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const drepId = urlParams.get('drep');
    if (drepId) {
      const drep = dreps.find((d) => d.drep_id === drepId);
      if (drep) {
        setSelectedDRep(drep);
      }
    }
  }, [dreps]);

  const filteredDReps = dreps.filter((drep) => {
    const matchesSearch = 
      (drep.metadata?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (drep.metadata?.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      drep.drep_id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleDelegate = async () => {
    if (!connectedWallet || !selectedDRep) return;

    reset();
    setShowModal(true);
    setBuilding(true);

    try {
      const txHash = await submitDelegationTransaction(connectedWallet, selectedDRep.drep_id);
      setBuilding(false);
      setTxHash(txHash);
    } catch (error: any) {
      setBuilding(false);
      setError(error.message || 'Failed to submit transaction');
    }
  };

  if (!connectedWallet) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Please connect your wallet to delegate voting rights</p>
          <p className="text-sm text-gray-500">Use the wallet connection button in the navigation bar</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-2xl font-bold mb-4">Select DRep</h2>
          
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search DReps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-field-green focus:border-transparent"
            />
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredDReps.length > 0 ? (
              <>
                {filteredDReps.map((drep) => {
                  const isSelected = selectedDRep?.drep_id === drep.drep_id;
                  const drepName = drep.metadata?.name || drep.view || drep.drep_id.slice(0, 8);
                  
                  return (
                    <button
                      key={drep.drep_id}
                      onClick={() => setSelectedDRep(drep)}
                      className={`w-full text-left p-4 rounded-md border-2 transition-colors ${
                        isSelected
                          ? 'border-field-green bg-field-green/10'
                          : 'border-gray-200 hover:border-field-green/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{drepName}</p>
                          {drep.metadata?.description && (
                            <p className="text-sm text-gray-600 line-clamp-1 mt-1">
                              {drep.metadata.description}
                            </p>
                          )}
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-field-green"></div>
                        )}
                      </div>
                    </button>
                  );
                })}
                {hasMore && onLoadMore && (
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      onClick={onLoadMore}
                      disabled={loading}
                      className="w-full"
                      size="sm"
                    >
                      {loading ? 'Loading...' : 'Load More DReps'}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {loading ? 'Loading DReps...' : 'No DReps found'}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-2xl font-bold mb-4">Delegation Details</h2>
          
          {selectedDRep ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Selected DRep</p>
                <p className="font-semibold text-lg">
                  {selectedDRep.metadata?.name || selectedDRep.view || selectedDRep.drep_id.slice(0, 8)}
                </p>
              </div>

              {selectedDRep.metadata?.description && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Description</p>
                  <p className="text-sm text-gray-700">{selectedDRep.metadata.description}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500 mb-1">Your Wallet</p>
                <p className="text-sm font-mono break-all">
                  {connectedWallet.address.slice(0, 20)}...
                </p>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-4">
                  By delegating, you will give this DRep the authority to vote on governance actions on your behalf.
                </p>
                <Button
                  onClick={() => setShowModal(true)}
                  size="lg"
                  className="w-full"
                  disabled={!selectedDRep}
                >
                  Delegate Voting Rights
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>Select a DRep from the list to begin</p>
            </div>
          )}
        </Card>
      </div>

      <TransactionModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          if (state.txHash || state.error) {
            reset();
          }
        }}
        isBuilding={state.isBuilding}
        isSigning={state.isSigning}
        isSubmitting={state.isSubmitting}
        txHash={state.txHash}
        error={state.error}
        onConfirm={handleDelegate}
      />
    </>
  );
}

