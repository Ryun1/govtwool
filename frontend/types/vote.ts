// CIP-136 Vote Rationale Types (adapted for DRep votes)

export interface VoteRationaleMetadata {
  '@context': {
    '@language': string;
    CIP100: string;
    CIP136: string;
    hashAlgorithm: string;
    body: {
      '@id': string;
      '@context': {
        references: {
          '@id': string;
          '@container': string;
          '@context': {
            GovernanceMetadata: string;
            Other: string;
            label: string;
            uri: string;
            RelevantArticles: string;
          };
        };
        summary: string;
        rationaleStatement: string;
        precedentDiscussion: string;
        counterargumentDiscussion: string;
        conclusion: string;
      };
    };
    authors: {
      '@id': string;
      '@container': string;
      '@context': {
        name: string;
        witness: {
          '@id': string;
          '@context': {
            witnessAlgorithm: string;
            publicKey: string;
            signature: string;
          };
        };
      };
    };
  };
  hashAlgorithm: 'blake2b-256';
  authors: VoteAuthor[];
  body: VoteBody;
}

export interface VoteAuthor {
  name: string;
  witness: VoteWitness;
}

export interface VoteWitness {
  witnessAlgorithm: 'ed25519';
  publicKey?: string;
  signature?: string;
}

export interface VoteBody {
  summary: string; // Required: 300 char limit
  rationaleStatement: string; // Required: Long form rationale
  precedentDiscussion?: string; // Optional: Discuss relevant precedent
  counterargumentDiscussion?: string; // Optional: Discuss counter-arguments
  conclusion?: string; // Optional: Conclude the rationale
  references?: VoteReference[];
}

export interface VoteReference {
  '@type': 'GovernanceMetadata' | 'Other' | 'RelevantArticles';
  label: string;
  uri: string;
}

export type VoteChoice = 'yes' | 'no' | 'abstain';

export interface VoteSubmission {
  drepId: string;
  proposalId: string;
  vote: VoteChoice;
  rationaleUrl?: string;
  rationaleHash?: string;
}
