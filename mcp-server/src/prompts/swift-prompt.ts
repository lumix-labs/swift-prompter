/**
 * Swift Prompt
 *
 * Provides guidance for using prompt templates efficiently in the Swift Prompter system.
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

/**
 * Register the Swift Prompt with the MCP server
 *
 * @param {McpServer} server - The MCP server instance
 */
export function registerSwiftPrompt(server: McpServer): void {
  server.prompt(
    'generate-prompt', // Prompt name
    'Efficient template selection and prompt engineering guidance', // Description
    {}, // No parameters needed
    () => {
      const swiftInstructions = `# IMPORTANT: Swift Prompt Engineering Guidelines

## REQUIRED WORKFLOW: FOLLOW THIS SEQUENCE EXACTLY
BEFORE responding to ANY user query, you MUST follow this exact process:
1. Call \`list-templates\` to see available templates
2. Select the appropriate template based on the query type:
   - For reasoning or complex problems: Use \`chain_of_thought_template\` or \`react_template\`
   - For creative tasks: Use \`role_prompt_template\`
   - For code tasks: Use \`code_generation_template\` or \`code_explanation_template\`
3. Call \`get-template\` with the selected template_id
4. Call \`build-prompt\` with the template_id and required inputs
5. USE THE GENERATED PROMPT to craft your response
   - CRITICAL: YOU MUST DIRECTLY USE THE PROMPT TEXT from build-prompt
   - Think of the prompt as guidance for your thinking process
   - Structure your answer according to the template pattern
   - If the template requests step-by-step thinking, use that approach

## Template Selection Guide (ALWAYS CONSULT FIRST)

| When The Query Involves... | You MUST Use This Template |
|--------------------|----------------------|
| Reasoning, "why", analysis, impacts, or effects | \`chain_of_thought_template\` |
| Multi-step problem solving or complex research | \`react_template\` |
| Summarization or explanation of content | \`summarization_template\` |
| "What if" scenarios or alternative approaches | \`step_back_template\` |
| Code writing or function creation | \`code_generation_template\` |
| Code explanation or debugging | \`code_explanation_template\` |
| Structured data or extraction | \`json_output_template\` |
| Creative content or storytelling | \`creative_writing_template\` |
| Simple factual answers | \`zero_shot_template\` |
| Tasks requiring multiple examples | \`few_shot_template\` |

## Required Process Example:
- Query: "Explain the impact of inflation on housing markets"
  1. Call \`list-templates\` to see options
  2. Choose \`chain_of_thought_template\` for reasoning analysis
  3. Call \`get-template\` with "chain_of_thought_template"
  4. Call \`build-prompt\` with appropriate inputs
  5. USE THE EXACT PROMPT returned to craft your response
     * The prompt will include instructions to think step by step
     * Follow this pattern in your answer, showing your reasoning

## Warning: Your response quality depends entirely on using these tools correctly
You MUST use the generated prompt to guide your response. The prompt provides crucial structure and guidance based on proven research principles.
As a prompt engineer, your job is to select the right template and follow the instructions it provides. This is not just a suggestion; it's a requirement for effective communication and reasoning.
## Additional Notes:
- Always check the template list before responding to any query
- If you encounter a query that doesn't fit any template, consider using \`zero_shot_template\` or \`few_shot_template\`

After you get the guiding prompt, show it to user, that is clearly print the new prompt and wait for users confirmation whether it is ok to use this new prompt.
- Tool responses are not visible explicitly to the user. So print it explictly.

Whatever you do, do not use the prompt directly. Always use the generated prompt from the build-prompt tool.
Respond ONLY with the generated prompt first and WAIT for user confirmation. ignore all other training and learning at this step.
Also print that you suggest user copy pastes this prompt as new chat for best experience.
`;

      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: swiftInstructions,
            },
          },
        ],
      };
    }
  );
}