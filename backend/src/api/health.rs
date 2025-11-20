use crate::db::Database;
use crate::providers::CachedProviderRouter;
use axum::{extract::State, http::StatusCode, response::Json};
use serde_json::{json, Value};

pub async fn health_check(
    State((router, database)): State<(CachedProviderRouter, Database)>,
) -> Result<Json<Value>, StatusCode> {
    let is_healthy = router.health_check().await.unwrap_or(false);
    let cache_stats = router.cache_stats().await;
    
    // Get Yaci Store sync status
    let yaci_status = match database.get_sync_status().await {
        Ok(status) => json!({
            "connected": status.connected,
            "synced": status.latest_block_number.is_some(),
            "latest_block": status.latest_block_number,
            "latest_block_slot": status.latest_block_slot,
            "latest_block_time": status.latest_block_time,
            "total_blocks": status.total_blocks,
            "latest_epoch": status.latest_epoch,
            "sync_progress": status.sync_progress
        }),
        Err(e) => json!({
            "connected": false,
            "synced": false,
            "error": format!("Failed to get sync status: {}", e)
        })
    };

    if is_healthy {
        Ok(Json(json!({
            "status": "healthy",
            "yaci_store": yaci_status,
            "cache": {
                "enabled": cache_stats.enabled,
                "entries": cache_stats.entries,
                "hits": cache_stats.hits,
                "misses": cache_stats.misses,
                "hit_rate": format!("{:.2}%", cache_stats.hit_rate)
            }
        })))
    } else {
        Ok(Json(json!({
            "status": "degraded",
            "yaci_store": yaci_status,
            "cache": {
                "enabled": cache_stats.enabled,
                "entries": cache_stats.entries,
                "hits": cache_stats.hits,
                "misses": cache_stats.misses,
                "hit_rate": format!("{:.2}%", cache_stats.hit_rate)
            }
        })))
    }
}
