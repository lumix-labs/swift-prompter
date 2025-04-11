import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { logDebug, logWarn } from './logFormatter.js';

/**
 * Custom StdioServerTransport that properly filters out log messages
 */
export class CustomStdioServerTransport extends StdioServerTransport {
  constructor() {
    super();
    
    // Replace the standard stdin processing
    this.setupFilteredStdin();
  }

  /**
   * Set up filtered stdin to only process valid JSON-RPC messages
   */
  private setupFilteredStdin(): void {
    const stdin = process.stdin;
    
    // Create a message buffer
    let buffer = '';
    
    // Handle incoming data
    stdin.on('data', (chunk: Buffer) => {
      const data = chunk.toString();
      buffer += data;
      
      // Process complete messages (might be multiple per chunk)
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Last line might be incomplete
      
      for (const line of lines) {
        if (line.trim()) {
          this.processLine(line);
        }
      }
    });
  }
  
  /**
   * Process a single line of input
   */
  private processLine(line: string): void {
    if (this.isValidJsonRpcMessageString(line)) {
      // For valid JSON-RPC messages, use the parent class functionality
      // This directly accesses the protected onMessage method
      (this as any).onMessage?.(line);
    } else {
      logDebug(`Filtered out non-JSON-RPC message`, 'swift-prompter-mcp-service', '1.0.0');
    }
  }

  /**
   * Validates if a string contains a valid JSON-RPC message
   */
  private isValidJsonRpcMessageString(message: string): boolean {
    if (!message.trim().startsWith('{')) {
      return false;
    }

    try {
      const parsed = JSON.parse(message);
      return this.isValidJsonRpcMessage(parsed);
    } catch (error) {
      logWarn(`Failed to parse JSON message`, 'swift-prompter-mcp-service', '1.0.0', 
              error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }

  /**
   * Validates if a parsed object is a proper JSON-RPC message
   */
  private isValidJsonRpcMessage(obj: any): boolean {
    if (typeof obj !== 'object' || obj === null) {
      return false;
    }
    
    // Must have jsonrpc version 2.0
    if (obj.jsonrpc !== '2.0') {
      return false;
    }
    
    // Must have an id that's either a string or number
    if (obj.id === undefined || (typeof obj.id !== 'string' && typeof obj.id !== 'number')) {
      return false;
    }
    
    // Must be either a request, response, or error notification
    const isRequest = typeof obj.method === 'string';
    const isResponse = obj.result !== undefined;
    const isError = typeof obj.error === 'object' && obj.error !== null;
    
    // Check for logging-specific fields
    const hasLogFields = obj.timestamp !== undefined && 
                         obj.level !== undefined && 
                         obj.service !== undefined;
    
    if (hasLogFields) {
      return false;
    }
    
    return isRequest || isResponse || isError;
  }
}
