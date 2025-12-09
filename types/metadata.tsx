export interface Source {
  file: string;
  link: string;
}

export interface TokenUsage {
  completion_tokens: number;
  prompt_tokens: number;
  total_tokens: number;
}

export interface EnrichedMetadata {
  model_used: string;
  token_usage: TokenUsage;
  sources?: Source[]; 
}