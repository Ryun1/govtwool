'use client';

import { ChangeEvent, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { TransactionModal } from './TransactionModal';
import { useWalletContext } from '../layout/WalletProvider';
import { useTransaction } from '@/hooks/useTransaction';
import {
  submitDRepRegistrationTransaction,
  submitDRepUpdateTransaction,
  submitDRepRetirementTransaction,
} from '@/lib/governance/transactions/registerDRep';

type DRepAction = 'register' | 'update' | 'retire';

interface FormState {
  metadataUrl: string;
  anchorUrl: string;
  anchorHash: string;
}

interface ActionConfig {
  selectorLabel: string;
  heading: string;
  description: string;
  buttonLabel: string;
  notes: string[];
  placeholderMessage?: string;
}

const INITIAL_FORM_STATE: FormState = {
  metadataUrl: '',
  anchorUrl: '',
  anchorHash: '',
};

const ACTION_CONFIG: Record<DRepAction, ActionConfig> = {
  register: {
    selectorLabel: 'Register',
    heading: 'Register as a DRep',
    description: 'Publish your DRep certificate and optional metadata so delegators can discover you.',
    buttonLabel: 'Register as DRep',
    notes: [
      'All metadata fields are optional but improve delegate transparency.',
      'Registration requires the DRep deposit in addition to transaction fees.',
      'Ensure your wallet has enough ADA to cover the deposit and fees.',
    ],
  },
  update: {
    selectorLabel: 'Update',
    heading: 'Update DRep Details',
    description: 'Refresh your anchor information or metadata. Deposit remains untouched.',
    buttonLabel: 'Update DRep',
    notes: [
      'Updating publishes new anchor data for your existing DRep.',
      'Provide both anchor URL and hash for verifiable updates.',
      'Only transaction fees are required for updates.',
    ],
  },
  retire: {
    selectorLabel: 'Retire',
    heading: 'Retire as a DRep',
    description: 'Deregister your DRep certificate and reclaim the deposit once processed.',
    buttonLabel: 'Retire DRep',
    notes: [
      'Retiring refunds your DRep deposit after the transaction is confirmed.',
      'You will need to register again to resume DRep responsibilities.',
      'Make sure you have communicated your retirement to delegators.',
    ],
  },
};

const ACTION_ORDER: DRepAction[] = ['register', 'update', 'retire'];

export default function RegisterDRepForm() {
  const { connectedWallet } = useWalletContext();
  const { state, reset, setBuilding, setSigning, setSubmitting, setTxHash, setError } = useTransaction();
  const [showModal, setShowModal] = useState(false);
  const [activeAction, setActiveAction] = useState<DRepAction>('register');
  const [formData, setFormData] = useState<FormState>({ ...INITIAL_FORM_STATE });

  const walletConnected = Boolean(connectedWallet);
  const actionConfig = ACTION_CONFIG[activeAction];
  const showMetadataField = activeAction === 'register';
  const showAnchorFields = activeAction !== 'retire';

  const handleInputChange = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!connectedWallet) {
      return;
    }

    reset();
    try {
      setBuilding(true);
      setSigning(false);
      setSubmitting(false);
      let txHash: string;
      if (activeAction === 'register') {
        txHash = await submitDRepRegistrationTransaction(connectedWallet, {
          metadataUrl: formData.metadataUrl || undefined,
          anchorUrl: formData.anchorUrl || undefined,
          anchorHash: formData.anchorHash || undefined,
        });
      } else if (activeAction === 'update') {
        txHash = await submitDRepUpdateTransaction(connectedWallet, {
          anchorUrl: formData.anchorUrl || undefined,
          anchorHash: formData.anchorHash || undefined,
        });
      } else {
        txHash = await submitDRepRetirementTransaction(connectedWallet);
      }
      setTxHash(txHash);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit transaction.';
      setError(message);
    } finally {
      setBuilding(false);
      setSigning(false);
      setSubmitting(false);
    }
  };

  const handleModalClose = () => {
    const wasSuccessful = Boolean(state.txHash);

    setShowModal(false);
    reset();

    if (wasSuccessful) {
      setFormData({ ...INITIAL_FORM_STATE });
    }
  };

  return (
    <>
      <Card className="max-w-3xl mx-auto">
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-display font-bold">{actionConfig.heading}</h2>
            <p className="text-sm text-muted-foreground">{actionConfig.description}</p>
            {!walletConnected && (
              <p className="text-xs text-destructive">Connect a wallet from the navigation bar to manage your DRep.</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {ACTION_ORDER.map(action => (
              <Button
                key={action}
                type="button"
                variant={activeAction === action ? 'primary' : 'outline'}
                onClick={() => {
                  setActiveAction(action);
                  reset();
                  setFormData({ ...INITIAL_FORM_STATE });
                }}
              >
                {ACTION_CONFIG[action].selectorLabel}
              </Button>
            ))}
          </div>

          <div className="space-y-4">
            {showMetadataField && (
              <div className="space-y-2">
                <label htmlFor="metadata-url" className="block text-sm font-medium text-foreground">
                  Metadata URL (optional)
                </label>
                <input
                  id="metadata-url"
                  type="url"
                  value={formData.metadataUrl}
                  onChange={handleInputChange('metadataUrl')}
                  placeholder="https://example.com/metadata.json"
                  className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent placeholder:text-muted-foreground min-h-[44px]"
                  aria-label="Metadata URL for DRep registration"
                />
                <p className="text-xs text-muted-foreground">
                  Link to JSON metadata describing your DRep (name, description, contact, etc.).
                </p>
              </div>
            )}

            {showAnchorFields && (
              <>
                <div className="space-y-2">
                  <label htmlFor="anchor-url" className="block text-sm font-medium text-foreground">
                    Anchor URL (optional)
                  </label>
                  <input
                    id="anchor-url"
                    type="url"
                    value={formData.anchorUrl}
                    onChange={handleInputChange('anchorUrl')}
                    placeholder="https://example.com/anchor"
                    className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent placeholder:text-muted-foreground min-h-[44px]"
                    aria-label="Anchor URL for DRep"
                  />
                  <p className="text-xs text-muted-foreground">
                    Include a pointer to supporting materials for your DRep {activeAction === 'update' ? 'update' : 'registration'}.
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="anchor-hash" className="block text-sm font-medium text-foreground">
                    Anchor Hash (optional)
                  </label>
                  <input
                    id="anchor-hash"
                    type="text"
                    value={formData.anchorHash}
                    onChange={handleInputChange('anchorHash')}
                    placeholder="Hash of the anchor contents"
                    className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent font-mono placeholder:text-muted-foreground min-h-[44px]"
                    aria-label="Anchor hash for DRep"
                  />
                  <p className="text-xs text-muted-foreground">
                    Provide the hash of your anchor data to let delegators verify its integrity.
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Important Notes</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              {actionConfig.notes.map(note => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Connected wallet</p>
            <p className="text-sm font-mono break-all bg-muted px-3 py-2 rounded text-foreground">
              {connectedWallet?.address ?? 'Not connected'}
            </p>
          </div>

          <Button
            onClick={() => {
              reset();
              setShowModal(true);
            }}
            size="lg"
            className="w-full"
            disabled={!walletConnected}
          >
            {actionConfig.buttonLabel}
          </Button>
        </div>
      </Card>

      <TransactionModal
        isOpen={showModal}
        onClose={handleModalClose}
        isBuilding={state.isBuilding}
        isSigning={state.isSigning}
        isSubmitting={state.isSubmitting}
        txHash={state.txHash}
        error={state.error}
        onConfirm={handleSubmit}
      />
    </>
  );
}

