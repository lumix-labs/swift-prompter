import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { logInfo, logError } from '../utils/logFormatter.js';

/**
 * Base Tool Class
 * 
 * Foundation class for all Swift Prompter tools. It provides:
 * 1. Standard tool registration with MCP server
 * 2. Common error handling patterns
 * 3. Logging standardization
 * 
 * All tool implementations should extend this class.
 */
export abstract class BaseTool<TInput = any, TOutput = any> {
  protected toolId: string;
  protected toolVersion: string;
  protected description: string;
  protected serviceNamespace = 'swift-prompter-mcp-service';
  protected serviceVersion = '1.0.0';

  /**
   * Create a new tool
   * 
   * @param toolId - Unique identifier for the tool
   * @param toolVersion - Semantic version of the tool
   * @param description - Human-readable description of the tool
   */
  constructor(toolId: string, toolVersion: string, description: string) {
    this.toolId = toolId;
    this.toolVersion = toolVersion;
    this.description = description;
  }

  /**
   * Get the schema definition for this tool
   * This must be implemented by each tool
   */
  protected abstract getSchema(): Record<string, z.ZodType<any>>;

  /**
   * Implement the tool's core functionality
   * This must be implemented by each tool
   * 
   * @param input - Tool input parameters
   * @returns Tool output
   */
  protected abstract execute(input: TInput): Promise<TOutput>;

  /**
   * Format the response for the client
   * May be overridden by specific tools for custom formatting
   * 
   * @param result - Raw execution result
   * @returns Formatted response for client
   */
  protected formatResponse(result: TOutput): any {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2)
        }
      ],
      results: result
    };
  }

  /**
   * Format error responses
   * 
   * @param error - Error object
   * @returns Formatted error response for client
   */
  protected formatErrorResponse(error: Error): any {
    return {
      error: true,
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`
        }
      ]
    };
  }

  /**
   * Register the tool with the MCP server
   * 
   * @param server - MCP server instance
   */
  public register(server: McpServer): void {
    try {
      server.tool(this.toolId, this.description, this.getSchema(), async (args: { [x: string]: any; }, extra: any) => {
        try {
          // Execute tool functionality with properly typed input
          const result = await this.execute(args as TInput);
          
          // Return formatted response
          return this.formatResponse(result);
        } catch (error) {
          // Handle errors
          const err = error instanceof Error ? error : new Error(String(error));
          
          logError(`Error executing tool: ${this.toolId}`, this.serviceNamespace, this.serviceVersion, err, {
            context: {
              input: JSON.stringify(args)
            }
          });
          
          return this.formatErrorResponse(err);
        }
      });
      
      logInfo(`${this.toolId} tool registered successfully`, this.serviceNamespace, this.serviceVersion);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      logError(`Error registering tool: ${this.toolId}`, this.serviceNamespace, this.serviceVersion, err);
      
      throw err;
    }
  }
}
