use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum VoteChoice {
    Yes,
    No,
    Abstain,
}

impl VoteChoice {
    pub fn from_str(value: &str) -> Option<Self> {
        match value.to_ascii_lowercase().as_str() {
            "yes" => Some(Self::Yes),
            "no" => Some(Self::No),
            "abstain" | "abstenstion" | "abstention" => Some(Self::Abstain),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "snake_case")]
pub struct ParticipationSummary {
    pub total_eligible: usize,
    pub total_voted: usize,
    pub total_missing: usize,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub turnout_percentage: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct ParticipationGroup<T> {
    pub summary: ParticipationSummary,
    pub participants: Vec<T>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct ActionVoteRecord {
    pub voter_identifier: String,
    pub voter_type: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub vote: Option<VoteChoice>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub voting_power: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tx_hash: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cert_index: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub block_time: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct DRepParticipation {
    pub drep_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub given_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub view: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub hex: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub has_profile: Option<bool>,
    pub has_voted: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub vote: Option<VoteChoice>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub voting_power: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tx_hash: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cert_index: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub block_time: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct StakePoolParticipation {
    pub pool_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ticker: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub homepage: Option<String>,
    pub has_voted: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub vote: Option<VoteChoice>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub voting_power: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tx_hash: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cert_index: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub block_time: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct CommitteeMemberInfo {
    pub identifier: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub role: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub hot_key: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cold_key: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expiry_epoch: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct CommitteeParticipation {
    pub identifier: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub role: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub hot_key: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cold_key: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expiry_epoch: Option<u32>,
    pub has_voted: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub vote: Option<VoteChoice>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub voting_power: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tx_hash: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cert_index: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub block_time: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct ActionVoterParticipation {
    pub dreps: ParticipationGroup<DRepParticipation>,
    pub stake_pools: ParticipationGroup<StakePoolParticipation>,
    pub committee: ParticipationGroup<CommitteeParticipation>,
}

pub fn calculate_summary<T>(participants: &[T], voted: usize) -> ParticipationSummary {
    let total = participants.len();
    let missing = total.saturating_sub(voted);
    let turnout_percentage = if total > 0 {
        Some((voted as f64 / total as f64) * 100.0)
    } else {
        None
    };

    ParticipationSummary {
        total_eligible: total,
        total_voted: voted,
        total_missing: missing,
        turnout_percentage,
    }
}

