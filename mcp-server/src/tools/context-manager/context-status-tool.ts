import { z } from 'zod';
import { BaseTool } from '../base-tool.js';
import { ContextTracker } from './context-tracker.js';
import { ContextStatusResponse } from '../template-store/types.js';
import { logError } from '../../utils/logFormatter.js';

/**
 * Context Status Tool
 * 
 * MCP tool for checking context utilization status.
 */
export class ContextStatusTool extends BaseTool<{}, ContextStatusResponse> {
  private contextTracker: ContextTracker;

  /**
   * Create a new context status tool
   * 
   * @param contextTracker - Context tracker instance
   */
  constructor(contextTracker: ContextTracker) {
    super(
      'context-status',
      '1.0.0',
      'Checks current context utilization and provides recommendations'
    );
    
    this.contextTracker = contextTracker;
  }

  /**
   * Get the Zod schema for this tool
   */
  protected getSchema(): Record<string, z.ZodType<any>> {
    return {}; // No input parameters required
  }

  /**
   * Execute the tool
   * 
   * @returns Context status information
   */
  protected async execute(): Promise<ContextStatusResponse> {
    try {
      return this.contextTracker.getStatus();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logError('Error retrieving context status', this.serviceNamespace, this.serviceVersion, err);
      throw err;
    }
  }

  /**
   * Format the response for better readability
   */
  protected formatResponse(result: ContextStatusResponse): any {
    const usedPercentFormatted = (result.used_percentage * 100).toFixed(1);
    const remainingPercentFormatted = (result.remaining_percentage * 100).toFixed(1);
    
    const recommendation = result.recommended_action === 'new_chat' 
      ? "Recommend starting a new chat for optimal performance."
      : "Continuing in current chat is fine.";
    
    return {
      content: [
        {
          type: "text",
          text: `# Context Utilization\n\n- Used: ${result.used_capacity} tokens (${usedPercentFormatted}%)\n- Remaining: ${result.remaining_capacity} tokens (${remainingPercentFormatted}%)\n- Total Capacity: ${result.total_capacity} tokens\n\n**Recommendation**: ${recommendation}`
        }
      ],
      results: result
    };
  }
}
