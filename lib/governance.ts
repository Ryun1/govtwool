import { blockfrostFetch } from './blockfrost';
import type { DRep, GovernanceAction, VotingResult, DRepVotingHistory, ActionVotingBreakdown } from '@/types/governance';

/**
 * Fetch all DReps (fetches all pages - use getDRepsPage for pagination)
 * Reference: https://docs.blockfrost.io/#tag/cardano--governance/get/governance/dreps
 */
export async function getDReps(): Promise<DRep[]> {
  try {
    // Blockfrost API uses pagination, fetch all pages
    let allDReps: any[] = [];
    let page = 1;
    let hasMore = true;
    
    while (hasMore) {
      // Use blockfrostFetch helper for authenticated requests
      const dreps = await blockfrostFetch(`/governance/dreps?page=${page}&count=100`);
      
      // If endpoint returns null (404 or invalid path), governance endpoints might not be available
      if (dreps === null) {
        console.warn('DReps endpoint not available - returning empty array');
        return [];
      }
      
      if (!dreps || !Array.isArray(dreps)) {
        hasMore = false;
        break;
      }
      
      if (dreps.length > 0) {
        allDReps = [...allDReps, ...dreps];
        // Check if there are more pages (Blockfrost returns 100 items per page by default)
        hasMore = dreps.length === 100;
        page++;
      } else {
        hasMore = false;
      }
    }
    
    return allDReps.map((drep: any) => ({
      drep_id: drep.drep_id,
      drep_hash: drep.drep_hash,
      view: drep.view,
      url: drep.url,
      metadata: drep.metadata,
      anchor: drep.anchor,
      voting_power: drep.voting_power,
      voting_power_active: drep.voting_power_active,
      status: drep.status,
      registration_tx_hash: drep.registration_tx_hash,
      registration_epoch: drep.registration_epoch,
    }));
  } catch (error) {
    console.error('Error fetching DReps:', error);
    return [];
  }
}

/**
 * Fetch a single page of DReps with pagination
 * Reference: https://docs.blockfrost.io/#tag/cardano--governance/get/governance/dreps
 */
export async function getDRepsPage(page: number = 1, count: number = 20): Promise<{ dreps: DRep[]; hasMore: boolean; total?: number }> {
  try {
    const dreps = await blockfrostFetch(`/governance/dreps?page=${page}&count=${count}`);
    
    // If endpoint returns null (404 or invalid path), governance endpoints might not be available
    if (dreps === null) {
      console.warn('DReps endpoint not available - returning empty array');
      return { dreps: [], hasMore: false };
    }
    
    if (!dreps || !Array.isArray(dreps)) {
      return { dreps: [], hasMore: false };
    }
    
    const mappedDReps = dreps.map((drep: any) => ({
      drep_id: drep.drep_id,
      drep_hash: drep.drep_hash,
      view: drep.view,
      url: drep.url,
      metadata: drep.metadata,
      anchor: drep.anchor,
      voting_power: drep.voting_power,
      voting_power_active: drep.voting_power_active,
      status: drep.status,
      registration_tx_hash: drep.registration_tx_hash,
      registration_epoch: drep.registration_epoch,
    }));
    
    // Check if there are more pages (if we got the full count, there might be more)
    const hasMore = dreps.length === count;
    
    return { dreps: mappedDReps, hasMore };
  } catch (error) {
    console.error('Error fetching DReps page:', error);
    return { dreps: [], hasMore: false };
  }
}

/**
 * Fetch a single DRep by ID
 * Reference: https://docs.blockfrost.io/#tag/cardano--governance/get/governance/dreps/drep_id
 */
export async function getDRep(drepId: string): Promise<DRep | null> {
  try {
    const drep = await blockfrostFetch(`/governance/dreps/${drepId}`);
    
    // If endpoint returns null (404 or invalid path), governance endpoints might not be available
    if (drep === null) {
      console.warn('DRep endpoint not available');
      return null;
    }
    
    if (!drep) {
      return null;
    }
    
    return {
      drep_id: drep.drep_id,
      drep_hash: drep.drep_hash,
      view: drep.view,
      url: drep.url,
      metadata: drep.metadata,
      anchor: drep.anchor,
      voting_power: drep.voting_power,
      voting_power_active: drep.voting_power_active,
      status: drep.status,
      registration_tx_hash: drep.registration_tx_hash,
      registration_epoch: drep.registration_epoch,
    };
  } catch (error: any) {
    // Handle 404 errors gracefully
    if (error?.message?.includes('404') || error?.status === 404) {
      return null;
    }
    console.error('Error fetching DRep:', error);
    return null;
  }
}

/**
 * Fetch DRep voting history and statistics
 * Reference: https://docs.blockfrost.io/#tag/cardano--governance/get/governance/dreps/drep_id/votes
 */
export async function getDRepVotingHistory(drepId: string): Promise<DRepVotingHistory[]> {
  try {
    // Handle pagination for voting history
    let allVotes: any[] = [];
    let page = 1;
    let hasMore = true;
    
    while (hasMore) {
      const votes = await blockfrostFetch(`/governance/dreps/${drepId}/votes?page=${page}&count=100`);
      
      // If endpoint returns null (404 or invalid path), governance endpoints might not be available
      if (votes === null) {
        console.warn('DRep voting history endpoint not available - returning empty array');
        return [];
      }
      
      if (!votes || !Array.isArray(votes)) {
        hasMore = false;
        break;
      }
      
      if (votes.length > 0) {
        allVotes = [...allVotes, ...votes];
        hasMore = votes.length === 100;
        page++;
      } else {
        hasMore = false;
      }
    }
    
    return allVotes.map((item: any) => ({
      action_id: item.action_id,
      vote: item.vote,
      voting_power: item.voting_power || '0',
      epoch: item.epoch,
    }));
  } catch (error: any) {
    // Handle 404 errors gracefully
    if (error?.message?.includes('404') || error?.status === 404) {
      return [];
    }
    console.error('Error fetching DRep voting history:', error);
    return [];
  }
}

/**
 * Fetch all governance actions
 * Reference: https://docs.blockfrost.io/#tag/cardano--governance/get/governance/actions
 */
export async function getGovernanceActions(): Promise<GovernanceAction[]> {
  try {
    // Handle pagination
    let allActions: any[] = [];
    let page = 1;
    let hasMore = true;
    
    while (hasMore) {
      const actions = await blockfrostFetch(`/governance/actions?page=${page}&count=100`);
      
      // If endpoint returns null (404 or invalid path), governance endpoints might not be available
      if (actions === null) {
        console.warn('Governance actions endpoint not available - returning empty array');
        return [];
      }
      
      if (!actions || !Array.isArray(actions)) {
        hasMore = false;
        break;
      }
      
      if (actions.length > 0) {
        allActions = [...allActions, ...actions];
        hasMore = actions.length === 100;
        page++;
      } else {
        hasMore = false;
      }
    }
    
    return allActions.map((action: any) => ({
      tx_hash: action.tx_hash,
      action_id: action.action_id,
      deposit: action.deposit,
      reward_account: action.reward_account,
      type: action.type,
      description: action.description,
      status: action.status,
      voting_epoch: action.voting_epoch,
      enactment_epoch: action.enactment_epoch,
      expiry_epoch: action.expiry_epoch,
      metadata: action.metadata,
    }));
  } catch (error) {
    console.error('Error fetching governance actions:', error);
    return [];
  }
}

/**
 * Fetch a single governance action by ID
 * Reference: https://docs.blockfrost.io/#tag/cardano--governance/get/governance/actions/action_id
 */
export async function getGovernanceAction(actionId: string): Promise<GovernanceAction | null> {
  try {
    const action = await blockfrostFetch(`/governance/actions/${actionId}`);
    
    // If endpoint returns null (404 or invalid path), governance endpoints might not be available
    if (action === null) {
      console.warn('Governance action endpoint not available');
      return null;
    }
    
    if (!action) {
      return null;
    }
    
    return {
      tx_hash: action.tx_hash,
      action_id: action.action_id,
      deposit: action.deposit,
      reward_account: action.reward_account,
      type: action.type,
      description: action.description,
      status: action.status,
      voting_epoch: action.voting_epoch,
      enactment_epoch: action.enactment_epoch,
      expiry_epoch: action.expiry_epoch,
      metadata: action.metadata,
    };
  } catch (error: any) {
    // Handle 404 errors gracefully
    if (error?.message?.includes('404') || error?.status === 404) {
      return null;
    }
    console.error('Error fetching governance action:', error);
    return null;
  }
}

/**
 * Fetch voting results for a governance action
 * Reference: https://docs.blockfrost.io/#tag/cardano--governance/get/governance/actions/action_id/votes
 */
export async function getActionVotingResults(actionId: string): Promise<ActionVotingBreakdown> {
  try {
    // Handle pagination for votes
    let allVotes: any[] = [];
    let page = 1;
    let hasMore = true;
    
    while (hasMore) {
      const votes = await blockfrostFetch(`/governance/actions/${actionId}/votes?page=${page}&count=100`);
      
      // If endpoint returns null (404 or invalid path), governance endpoints might not be available
      if (votes === null) {
        console.warn('Action voting results endpoint not available - returning empty breakdown');
        return {
          drep_votes: { yes: '0', no: '0', abstain: '0' },
          spo_votes: { yes: '0', no: '0', abstain: '0' },
          cc_votes: { yes: '0', no: '0', abstain: '0' },
          total_voting_power: '0',
        };
      }
      
      if (!votes || !Array.isArray(votes)) {
        hasMore = false;
        break;
      }
      
      if (votes.length > 0) {
        allVotes = [...allVotes, ...votes];
        hasMore = votes.length === 100;
        page++;
      } else {
        hasMore = false;
      }
    }

    const votes = allVotes;
    
    const breakdown: ActionVotingBreakdown = {
      drep_votes: { yes: '0', no: '0', abstain: '0' },
      spo_votes: { yes: '0', no: '0', abstain: '0' },
      cc_votes: { yes: '0', no: '0', abstain: '0' },
      total_voting_power: '0',
    };

    let totalPower = BigInt(0);

    votes.forEach((vote: any) => {
      const power = BigInt(vote.voting_power || '0');
      totalPower += power;

      const voteValue = vote.vote === 'yes' ? 'yes' : vote.vote === 'no' ? 'no' : 'abstain';
      
      if (vote.voter_type === 'drep') {
        breakdown.drep_votes[voteValue] = (
          BigInt(breakdown.drep_votes[voteValue] || '0') + power
        ).toString();
      } else if (vote.voter_type === 'spo') {
        breakdown.spo_votes[voteValue] = (
          BigInt(breakdown.spo_votes[voteValue] || '0') + power
        ).toString();
      } else if (vote.voter_type === 'cc') {
        breakdown.cc_votes[voteValue] = (
          BigInt(breakdown.cc_votes[voteValue] || '0') + power
        ).toString();
      }
    });

    breakdown.total_voting_power = totalPower.toString();

    return breakdown;
  } catch (error: any) {
    // Handle 404 errors gracefully
    if (error?.message?.includes('404') || error?.status === 404) {
      return {
        drep_votes: { yes: '0', no: '0', abstain: '0' },
        spo_votes: { yes: '0', no: '0', abstain: '0' },
        cc_votes: { yes: '0', no: '0', abstain: '0' },
        total_voting_power: '0',
      };
    }
    console.error('Error fetching voting results:', error);
    return {
      drep_votes: { yes: '0', no: '0', abstain: '0' },
      spo_votes: { yes: '0', no: '0', abstain: '0' },
      cc_votes: { yes: '0', no: '0', abstain: '0' },
      total_voting_power: '0',
    };
  }
}

