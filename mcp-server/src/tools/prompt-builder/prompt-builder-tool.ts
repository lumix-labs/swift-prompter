import { z } from 'zod';
import { BaseTool } from '../base-tool.js';
import { PromptBuilder } from './prompt-builder.js';
import { TemplateStore } from '../template-store/store.js';
import { PromptBuildRequest, PromptBuildResponse } from '../template-store/types.js';
import { logError, logInfo } from '../../utils/logFormatter.js';

/**
 * Prompt Builder Tool
 * 
 * MCP tool for building prompts from templates and inputs.
 */
export class PromptBuilderTool extends BaseTool<PromptBuildRequest, PromptBuildResponse> {
  private promptBuilder: PromptBuilder;
  private templateStore: TemplateStore;

  /**
   * Create a new prompt builder tool
   * 
   * @param promptBuilder - Prompt builder instance
   * @param templateStore - Template store instance
   */
  constructor(promptBuilder: PromptBuilder, templateStore: TemplateStore) {
    super(
      'build-prompt',
      '1.0.0',
      'Builds optimized prompts from templates and input values'
    );
    
    this.promptBuilder = promptBuilder;
    this.templateStore = templateStore;
  }

  /**
   * Get the Zod schema for this tool
   */
  protected getSchema(): Record<string, z.ZodType<any>> {
    return {
      template_id: z.string().describe('ID of the template to use'),
      inputs: z.record(z.union([z.string(), z.boolean()])).describe('Input values for template variables')
    };
  }

  /**
   * Execute the tool
   * 
   * @param input - Build request with template ID and inputs
   * @returns Built prompt and metadata
   */
  protected async execute(input: PromptBuildRequest): Promise<PromptBuildResponse> {
    try {
      // Get the template
      const template = await this.templateStore.getTemplate(input.template_id);
      
      if (!template) {
        logError(
          'Template not found',
          this.serviceNamespace,
          this.serviceVersion,
          new Error(`Template not found: ${input.template_id}`)
        );
        
        return {
          prompt: '',
          template_id: input.template_id,
          template_name: 'Unknown Template',
          missing_inputs: ['Template not found']
        };
      }
      
      logInfo('Building prompt from template', this.serviceNamespace, this.serviceVersion, {
        context: {
          templateId: template.template_id,
          templateName: template.name
        }
      });
      
      // Build the prompt
      return this.promptBuilder.buildPrompt(template, input.inputs);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logError('Error building prompt', this.serviceNamespace, this.serviceVersion, err);
      throw err;
    }
  }

  /**
   * Format the response for better readability
   */
  protected formatResponse(result: PromptBuildResponse): any {
    if (result.missing_inputs && result.missing_inputs.length > 0) {
      return {
        content: [
          {
            type: "text",
            text: `Missing required inputs for template ${result.template_id}: ${result.missing_inputs.join(', ')}`
          }
        ],
        results: result
      };
    }
    
    return {
      content: [
        {
          type: "text",
          text: `Successfully built prompt from template "${result.template_name}".\n\nContext usage: ${result.context_usage} tokens\n\nPrompt:\n\`\`\`\n${result.prompt}\n\`\`\``
        }
      ],
      results: result
    };
  }
}
