# GovTwool Backend

Rust backend service that provides a unified REST API for Cardano governance data using Yaci Store indexer.

## Features

- **Self-Hosted Indexer**: Uses Yaci Store for blockchain indexing (no dependency on external APIs)
- **PostgreSQL Database**: Direct database queries for high performance
- **Type Safety**: Strong typing with Rust's type system
- **High Performance**: Async runtime with Tokio and connection pooling
- **Caching**: In-memory caching layer for frequently accessed data
- **Metadata Validation**: Optional Cardano Verifier API integration
- **DRep Enrichment**: Optional GovTools integration for enhanced DRep metadata

## Setup

### Prerequisites

- **Rust 1.70+** (stable toolchain)
- **Cargo** (comes with Rust)
- **PostgreSQL Database**: Yaci Store database must be running and accessible
- **Yaci Store Indexer**: Must be running and synced (see `../indexer/README.md`)

### Installation

1. Install Rust toolchain (if not already installed):
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

2. Ensure Yaci Store indexer is running and database is accessible (see `../indexer/README.md`)

3. Create a `.env` file in `backend/` with the required configuration:
```env
# Required: Database connection
DATABASE_URL=postgresql://postgres:password@localhost:5432/yaci_store

# Optional: Server configuration
PORT=8080
CACHE_ENABLED=true
CACHE_MAX_ENTRIES=10000

# Optional: GovTools enrichment
GOVTOOLS_ENABLED=false
GOVTOOLS_BASE_URL=https://be.preview.gov.tools

# Optional: Metadata validation
CARDANO_VERIFIER_ENABLED=false
```

4. See `.env.example` for all available configuration options:
   - `DATABASE_URL`: PostgreSQL connection string (required)
   - `PORT`: Server port (defaults to `8080`)
   - `CACHE_ENABLED`: Toggle in-memory caching (default `true`)
   - `CACHE_MAX_ENTRIES`: Cache size limit (default `10000`)
   - `GOVTOOLS_ENABLED`: Toggle GovTools enrichment (default `false`)
   - `CARDANO_VERIFIER_ENABLED`: Toggle metadata validation (default `false`)

> **Note:** The current CORS configuration allows all origins when no override is provided. Fine-grained origin control will honour `CORS_ORIGINS` as the gateway hardening work progresses.

## Development

### Run the backend:

```bash
cd backend
cargo run
```

Keep the backend running in its own terminal and start the frontend separately from `frontend/` with `npm run dev`.

## API Endpoints

For detailed API documentation, see [API.md](./API.md).

### Quick Reference

**DRep Endpoints:**
- `GET /api/dreps` - Get paginated DRep list
- `GET /api/dreps/stats` - Get DRep statistics
- `GET /api/dreps/:id` - Get single DRep details
- `GET /api/dreps/:id/delegators` - Get DRep delegators
- `GET /api/dreps/:id/votes` - Get DRep voting history
- `GET /api/dreps/:id/metadata` - Get DRep metadata

**Governance Action Endpoints:**
- `GET /api/actions` - Get paginated governance actions
- `GET /api/actions/:id` - Get single governance action
- `GET /api/actions/:id/votes` - Get action voting results

**Stake Endpoints:**
- `GET /api/stake/:stake_address/delegation` - Retrieve pool, DRep, and balance information for a stake address

**Health Check:**
- `GET /health` - Health check endpoint with cache statistics

## Architecture

The backend queries Yaci Store's PostgreSQL database directly for all governance data:

- **DRep Data**: Queries `drep_registration` table
- **Governance Actions**: Queries `governance_action` table
- **Votes**: Queries `vote` table with joins to governance actions
- **Stake Delegations**: Queries `stake_delegation` and `stake_address` tables
- **Epoch Data**: Queries `epoch` table for epoch start times

All queries are optimized with proper indexing and connection pooling.

## Architecture

```
backend/
├── src/
│   ├── main.rs          # Server entry point
│   ├── config.rs        # Configuration management
│   ├── db/              # Database layer
│   │   ├── mod.rs       # Database connection pool
│   │   └── queries.rs   # SQL queries
│   ├── api/             # REST API handlers
│   │   ├── dreps.rs
│   │   ├── actions.rs
│   │   └── health.rs
│   ├── providers/       # Provider abstraction layer
│   │   ├── yaci_store.rs        # Yaci Store provider
│   │   ├── yaci_store_router.rs # Yaci Store router
│   │   ├── cached_router.rs     # Caching wrapper
│   │   └── router_trait.rs     # Router trait
│   ├── models/          # Data models
│   │   ├── drep.rs
│   │   ├── action.rs
│   │   └── common.rs
│   └── utils/           # Utility functions
│       ├── bech32.rs
│       ├── drep_id.rs   # CIP-105/CIP-129 conversions
│       └── proposal_id.rs
└── Cargo.toml
```

## Building for Production

```bash
cd backend
cargo build --release
```

The binary will be in `target/release/govtwool-backend`.

## License

Apache License 2.0

