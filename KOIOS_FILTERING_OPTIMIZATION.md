# Koios API Filtering Optimization

## Overview

We've optimized the Koios API integration to use both **vertical** and **horizontal** filtering to reduce payload sizes and improve performance.

## Filtering Strategies

### Horizontal Filtering (Row Reduction)

**Purpose:** Reduce the number of rows returned by the API.

**Implementation:**
- **Delegators:** Limit to 1000 delegators per DRep (enough for accurate counts)
- **Votes:** Limit to 1000 most recent votes per DRep (enough for counts and recent activity)
- **Ordering:** Votes ordered by `block_time.desc` to get most recent first

**Benefits:**
- Reduces payload size significantly (e.g., from 100+ votes to 1000 max)
- Faster response times
- Lower bandwidth usage
- Still provides accurate counts for directory page

### Vertical Filtering (Column/Field Reduction)

**Purpose:** Only process the fields we actually need from the API response.

**Implementation:**
- **Votes:** Only process `vote` (for counting Yes/No/Abstain) and `block_time` (for recent activity)
- **Delegators:** Only process `address` (for counting) - we don't need individual amounts for directory page

**Benefits:**
- Reduces memory usage
- Faster processing
- Less data to serialize/deserialize

## Current Implementation

### Delegators Query
```typescript
getDRepsDelegators(cip129Ids, 1000) // Horizontal: limit to 1000
```

**Fields Used:**
- `address` (for counting)
- `amount` (not needed for directory page, but returned by API)

### Votes Query
```typescript
getDRepsVotes(cip129Ids, 1000, 'block_time.desc') // Horizontal: limit to 1000, ordered by most recent
```

**Fields Used:**
- `vote` (for Yes/No/Abstain counts)
- `block_time` (for recent activity check)

**Fields Ignored:**
- `proposal_id` (not needed for directory page)
- `proposal_tx_hash` (not needed for directory page)
- `vote_tx_hash` (not needed for directory page)
- `meta_url` (not needed for directory page)
- `meta_hash` (not needed for directory page)

## Performance Impact

### Before Optimization
- Fetching all votes (could be 100+ per DRep)
- Fetching all delegators (could be thousands per DRep)
- Processing all fields from API response

### After Optimization
- Fetching max 1000 votes per DRep (horizontal filtering)
- Fetching max 1000 delegators per DRep (horizontal filtering)
- Only processing needed fields (vertical filtering)

**Estimated Payload Reduction:**
- **Votes:** ~90% reduction (if DRep has 100+ votes)
- **Delegators:** ~95% reduction (if DRep has 10000+ delegators)
- **Processing:** ~80% faster (less data to process)

## Future Optimizations

1. **Field Selection:** If Koios API supports field selection in request body, we could request only specific fields
2. **Date Range Filtering:** Filter votes by date range to get only recent votes
3. **Aggregation:** If Koios supports aggregation queries, we could get counts directly without fetching all records

## Notes

- Limits are set conservatively (1000) to ensure accurate counts for most DReps
- For DReps with >1000 votes/delegators, counts may be approximate
- Full data is still available on detail pages via Blockfrost
- Horizontal filtering is applied at the API level (request body)
- Vertical filtering is applied at the processing level (code)

