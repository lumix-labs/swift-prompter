import { ContextStatusResponse } from '../template-store/types.js';
import { logInfo } from '../../utils/logFormatter.js';

/**
 * Context Tracker
 * 
 * Tracks context usage within a conversation and provides
 * recommendations for when to start a new chat.
 */
export class ContextTracker {
  // Model context capacity is an estimated value and can be adjusted
  private totalCapacity: number = 100000; // tokens
  private usedCapacity: number = 0;
  private serviceNamespace = 'swift-prompter-mcp-service';
  private serviceVersion = '1.0.0';

  /**
   * Create a new context tracker
   * 
   * @param initialUsage - Initial context usage (in tokens)
   * @param modelCapacity - Total model capacity (in tokens)
   */
  constructor(initialUsage: number = 0, modelCapacity?: number) {
    this.usedCapacity = initialUsage;
    
    if (modelCapacity) {
      this.totalCapacity = modelCapacity;
    }
    
    logInfo('Context tracker initialized', this.serviceNamespace, this.serviceVersion, {
      context: {
        totalCapacity: this.totalCapacity,
        initialUsage: this.usedCapacity
      }
    });
  }

  /**
   * Estimate the token count for a text
   * 
   * This is a simple estimation - 1 token ~= 4 characters
   * For production use, this should be replaced with a more accurate tokenizer
   * 
   * @param text - Text to estimate token count for
   * @returns Estimated token count
   */
  public estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Record context usage
   * 
   * @param tokens - Number of tokens used
   */
  public recordUsage(tokens: number): void {
    this.usedCapacity += tokens;
    
    logInfo('Context usage recorded', this.serviceNamespace, this.serviceVersion, {
      context: {
        addedTokens: tokens,
        totalUsed: this.usedCapacity,
        remainingPercentage: this.getRemainingPercentage()
      }
    });
  }

  /**
   * Record usage from text
   * 
   * @param text - Text to record usage for
   * @returns Number of tokens recorded
   */
  public recordTextUsage(text: string): number {
    const tokens = this.estimateTokens(text);
    this.recordUsage(tokens);
    return tokens;
  }

  /**
   * Get the current remaining percentage
   * 
   * @returns Percentage of context remaining (0-1)
   */
  public getRemainingPercentage(): number {
    return 1 - (this.usedCapacity / this.totalCapacity);
  }

  /**
   * Get the current context status
   * 
   * @param optimalRemaining - Optimal remaining percentage (defaults to 0.3)
   * @returns Context status response
   */
  public getStatus(optimalRemaining: number = 0.3): ContextStatusResponse {
    const usedPercentage = this.usedCapacity / this.totalCapacity;
    const remainingPercentage = 1 - usedPercentage;
    
    // Determine if a new chat is recommended
    const recommendedAction = remainingPercentage < optimalRemaining ? 'new_chat' : 'continue';
    
    return {
      total_capacity: this.totalCapacity,
      used_capacity: this.usedCapacity,
      remaining_capacity: this.totalCapacity - this.usedCapacity,
      used_percentage: usedPercentage,
      remaining_percentage: remainingPercentage,
      recommended_action: recommendedAction
    };
  }

  /**
   * Reset the context usage
   */
  public reset(): void {
    this.usedCapacity = 0;
    
    logInfo('Context usage reset', this.serviceNamespace, this.serviceVersion);
  }
}
