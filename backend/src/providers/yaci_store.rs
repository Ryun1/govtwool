use crate::db::{Database, queries};
use crate::models::*;
use crate::providers::Provider;
use crate::utils::drep_id::normalize_to_cip129;
use async_trait::async_trait;
use sqlx::PgPool;
use std::sync::Arc;

pub struct YaciStoreProvider {
    db: Arc<Database>,
}

impl YaciStoreProvider {
    pub fn new(database: Database) -> Self {
        Self {
            db: Arc::new(database),
        }
    }

    fn pool(&self) -> &PgPool {
        self.db.pool()
    }
}

#[async_trait]
impl Provider for YaciStoreProvider {
    async fn get_dreps_page(&self, query: &DRepsQuery) -> Result<DRepsPage, anyhow::Error> {
        queries::get_dreps_page(self.pool(), query).await
    }

    async fn get_drep(&self, id: &str) -> Result<Option<DRep>, anyhow::Error> {
        // Try to normalize the ID and query
        let normalized_id = normalize_to_cip129(id).unwrap_or_else(|_| id.to_string());
        queries::get_drep(self.pool(), &normalized_id).await
    }

    async fn get_drep_delegators(&self, id: &str) -> Result<Vec<DRepDelegator>, anyhow::Error> {
        let normalized_id = normalize_to_cip129(id).unwrap_or_else(|_| id.to_string());
        queries::get_drep_delegators(self.pool(), &normalized_id).await
    }

    async fn get_drep_voting_history(
        &self,
        id: &str,
    ) -> Result<Vec<DRepVotingHistory>, anyhow::Error> {
        let normalized_id = normalize_to_cip129(id).unwrap_or_else(|_| id.to_string());
        queries::get_drep_voting_history(self.pool(), &normalized_id).await
    }

    async fn get_governance_actions_page(
        &self,
        page: u32,
        count: u32,
    ) -> Result<ActionsPage, anyhow::Error> {
        queries::get_governance_actions_page(self.pool(), page, count).await
    }

    async fn get_governance_action(
        &self,
        id: &str,
    ) -> Result<Option<GovernanceAction>, anyhow::Error> {
        queries::get_governance_action(self.pool(), id).await
    }

    async fn get_action_voting_results(
        &self,
        id: &str,
    ) -> Result<ActionVotingBreakdown, anyhow::Error> {
        queries::get_action_voting_results(self.pool(), id).await
    }

    async fn get_drep_metadata(
        &self,
        id: &str,
    ) -> Result<Option<serde_json::Value>, anyhow::Error> {
        // Get DRep first to check for metadata
        let normalized_id = normalize_to_cip129(id).unwrap_or_else(|_| id.to_string());
        match queries::get_drep(self.pool(), &normalized_id).await? {
            Some(drep) => {
                if let Some(metadata) = drep.metadata {
                    Ok(Some(serde_json::json!({
                        "json_metadata": metadata.extra,
                        "url": drep.url,
                        "hash": drep.anchor.as_ref().map(|a| &a.data_hash)
                    })))
                } else {
                    Ok(None)
                }
            }
            None => Ok(None),
        }
    }

    async fn get_total_active_dreps(&self) -> Result<Option<u32>, anyhow::Error> {
        queries::get_total_active_dreps(self.pool()).await
    }

    async fn get_stake_delegation(
        &self,
        stake_address: &str,
    ) -> Result<Option<StakeDelegation>, anyhow::Error> {
        queries::get_stake_delegation(self.pool(), stake_address).await
    }

    async fn health_check(&self) -> Result<bool, anyhow::Error> {
        self.db.health_check().await
    }
}

// Additional methods used by CachedProviderRouter
impl YaciStoreProvider {
    pub async fn get_action_vote_records(
        &self,
        action: &GovernanceAction,
    ) -> Result<Vec<ActionVoteRecord>, anyhow::Error> {
        // Placeholder - will implement with actual query
        // This needs to query votes table and join with DRep/pool/committee info
        Ok(Vec::new())
    }

    pub async fn get_stake_pools_page(
        &self,
        page: u32,
        count: u32,
    ) -> Result<StakePoolPage, anyhow::Error> {
        // Placeholder - will implement with actual query
        Ok(StakePoolPage {
            pools: Vec::new(),
            has_more: false,
            total: None,
        })
    }

    pub async fn get_committee_members(&self) -> Result<Vec<CommitteeMemberInfo>, anyhow::Error> {
        // Placeholder - will implement with actual query
        // This queries committee/constitutional committee members
        Ok(Vec::new())
    }

    pub async fn get_epoch_start_time(&self, epoch: u32) -> Result<Option<u64>, anyhow::Error> {
        queries::get_epoch_start_time(self.pool(), epoch).await
    }
}

