// Cardano Governance Types

export interface DRep {
  drep_id: string;
  drep_hash?: string;
  view?: string;
  url?: string;
  metadata?: {
    name?: string;
    email?: string;
    description?: string;
    website?: string;
    logo?: string;
    [key: string]: any;
  };
  anchor?: {
    url: string;
    data_hash: string;
  };
  voting_power?: string;
  voting_power_active?: string;
  status?: 'active' | 'inactive' | 'retired';
  registration_tx_hash?: string;
  registration_epoch?: number;
}

export interface GovernanceAction {
  tx_hash: string;
  action_id: string;
  deposit?: string;
  reward_account?: string;
  type: 'parameter_change' | 'hard_fork_initiation' | 'treasury_withdrawals' | 'no_confidence' | 'update_committee' | 'new_committee' | 'info';
  description?: string;
  status?: 'submitted' | 'voting' | 'ratified' | 'enacted' | 'expired' | 'rejected';
  voting_epoch?: number;
  enactment_epoch?: number;
  expiry_epoch?: number;
  metadata?: {
    title?: string;
    description?: string;
    rationale?: string;
    [key: string]: any;
  };
}

export interface VotingResult {
  action_id: string;
  yes_votes: string;
  no_votes: string;
  abstain_votes: string;
  voter_type: 'drep' | 'spo' | 'cc';
  voting_power?: string;
}

export interface DRepVotingHistory {
  action_id?: string;
  vote: 'yes' | 'no' | 'abstain';
  voting_power?: string;
  epoch?: number;
}

export interface ActionVotingBreakdown {
  drep_votes: {
    yes: string;
    no: string;
    abstain: string;
  };
  spo_votes: {
    yes: string;
    no: string;
    abstain: string;
  };
  cc_votes: {
    yes: string;
    no: string;
    abstain: string;
  };
  total_voting_power: string;
}

