import { Template, PromptBuildRequest, PromptBuildResponse } from '../template-store/types.js';
import { ContextTracker } from '../context-manager/context-tracker.js';
import { logInfo, logError } from '../../utils/logFormatter.js';

/**
 * Prompt Builder
 * 
 * Builds prompts from templates and input values.
 */
export class PromptBuilder {
  private contextTracker: ContextTracker;
  private serviceNamespace = 'swift-prompter-mcp-service';
  private serviceVersion = '1.0.0';

  /**
   * Create a new prompt builder
   * 
   * @param contextTracker - Context tracker instance
   */
  constructor(contextTracker: ContextTracker) {
    this.contextTracker = contextTracker;
  }

  /**
   * Build a prompt from a template and inputs
   * 
   * @param template - Template to use
   * @param inputs - Input values
   * @returns Built prompt and metadata
   */
  public buildPrompt(template: Template, inputs: Record<string, string | boolean>): PromptBuildResponse {
    try {
      logInfo('Building prompt', this.serviceNamespace, this.serviceVersion, {
        context: {
          templateId: template.template_id,
          inputKeys: Object.keys(inputs)
        }
      });

      // Check for missing required inputs
      const missingInputs = this.getMissingRequiredInputs(template, inputs);
      
      if (missingInputs.length > 0) {
        logInfo('Missing required inputs', this.serviceNamespace, this.serviceVersion, {
          context: {
            missingInputs
          }
        });

        return {
          prompt: '',
          template_id: template.template_id,
          template_name: template.name,
          missing_inputs: missingInputs
        };
      }

      // Clone the template pattern
      let prompt = template.pattern;
      
      // Prepare all input values, using defaults for those not provided
      const resolvedInputs = this.resolveInputs(template, inputs);
      
      // Replace placeholders in the pattern
      for (const [key, value] of Object.entries(resolvedInputs)) {
        const placeholder = `{${key}}`;
        prompt = prompt.replace(new RegExp(placeholder, 'g'), String(value));
      }

      // Estimate context usage
      const contextUsage = this.contextTracker.estimateTokens(prompt);
      
      // Record usage in the context tracker
      this.contextTracker.recordUsage(contextUsage);
      
      logInfo('Prompt built successfully', this.serviceNamespace, this.serviceVersion, {
        context: {
          templateId: template.template_id,
          contextUsage,
          promptLength: prompt.length
        }
      });

      return {
        prompt,
        template_id: template.template_id,
        template_name: template.name,
        context_usage: contextUsage
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logError('Error building prompt', this.serviceNamespace, this.serviceVersion, err, {
        context: {
          templateId: template.template_id
        }
      });
      
      throw err;
    }
  }

  /**
   * Get missing required inputs
   * 
   * @param template - Template to check
   * @param inputs - Provided inputs
   * @returns Array of missing input names
   */
  private getMissingRequiredInputs(template: Template, inputs: Record<string, string | boolean>): string[] {
    return template.inputs
      .filter(input => input.required && !inputs.hasOwnProperty(input.name))
      .map(input => input.name);
  }

  /**
   * Resolve all input values, using defaults for missing ones
   * 
   * @param template - Template to use
   * @param inputs - Provided inputs
   * @returns Resolved input values
   */
  private resolveInputs(template: Template, inputs: Record<string, string | boolean>): Record<string, string | boolean> {
    const resolvedInputs: Record<string, string | boolean> = {};
    
    // Process each template input
    for (const inputDef of template.inputs) {
      const { name, default: defaultValue } = inputDef;
      
      // Use provided value or default
      if (inputs.hasOwnProperty(name)) {
        resolvedInputs[name] = inputs[name];
      } else if (defaultValue !== undefined) {
        resolvedInputs[name] = defaultValue;
      }
    }
    
    return resolvedInputs;
  }
}
