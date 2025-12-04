export interface Metadata {
    model_used: string;
    token_usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    pricing: {
        input_price_per_million: number;
        output_price_per_million: number;
    };
    cost_estimate_usd: {
        input_cost: number;
        output_cost: number;
        total_cost: number;
    };
}