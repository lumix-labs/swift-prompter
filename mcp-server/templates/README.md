# Prompt Engineering Templates

This directory contains prompt templates based on Google's research paper on prompt engineering techniques. These templates incorporate best practices for achieving optimal results with large language models.

## Available Templates

### Basic Techniques
- **Zero Shot** (`zero_shot.yaml`): Simple prompts without examples
- **Few Shot** (`few_shot.yaml`): Includes examples to demonstrate patterns
- **System Prompt** (`system_prompt.yaml`): Sets overall context and purpose
- **Role Prompt** (`role_prompt.yaml`): Assigns specific character/role to the model
- **Context Prompt** (`context_prompt.yaml`): Provides specific background information

### Reasoning Techniques
- **Chain of Thought** (`chain_of_thought.yaml`): Encourages step-by-step reasoning
- **Step Back** (`step_back.yaml`): Consider general principles before specific problems
- **Self-Consistency** (`self_consistency.yaml`): Generate multiple reasoning paths
- **ReAct** (`react.yaml`): Combines reasoning with actions for complex problems

### Output Formatting
- **JSON Output** (`json_output.yaml`): Structures responses as valid JSON

### Code-Related
- **Code Generation** (`code_generation.yaml`): Creates well-documented code
- **Code Explanation** (`code_explanation.yaml`): Explains existing code

## Best Practices (Based on Google's Research)

1. **Provide Examples**: When possible, use few-shot prompting with 3-5 diverse examples.

2. **Design with Simplicity**: Keep prompts clear and concise without unnecessary information.

3. **Be Specific About Output**: Clearly state the desired format and content.

4. **Use Instructions Over Constraints**: Focus on what you want rather than what you don't want.

5. **Control Token Length**: Set appropriate max_tokens for your task.

6. **Adjust Temperature**: 
   - Use lower temperatures (0.0-0.3) for factual, deterministic tasks
   - Use higher temperatures (0.7-1.0) for creative content
   - Use balanced temperatures (0.3-0.7) for mixed tasks

7. **Configure Sampling Controls**: 
   - Adjust top-k and top-p settings based on the desired creativity vs. accuracy

8. **Document Your Process**: Track iterations of your prompts and their results

## Template Selection Guide

| When You Need To... | Recommended Template |
|--------------------|----------------------|
| Get a straight answer with no examples | `zero_shot.yaml` |
| Show the model a pattern to follow | `few_shot.yaml` |
| Solve a complex reasoning problem | `chain_of_thought.yaml` |
| Extract structured data | `json_output.yaml` |
| Generate creative content | `role_prompt.yaml` (high temperature) |
| Solve a multi-step problem | `react.yaml` |
| Write code | `code_generation.yaml` |
| Understand existing code | `code_explanation.yaml` |
| Answer questions with background info | `context_prompt.yaml` |

For optimal results, combine techniques (e.g., few-shot + chain-of-thought) for complex tasks.
