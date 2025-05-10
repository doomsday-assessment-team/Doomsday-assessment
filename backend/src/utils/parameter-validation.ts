
export type ParamType = 'string' | 'number' | 'boolean';

export interface ParamDefinition {
  name: string;
  type: ParamType;
  required?: boolean;
}

export function validateParamsWithMessage(
  query: Record<string, unknown>,
  definitions: ParamDefinition[]
): string | null {
  const messages: string[] = [];
  
  for (const { name, type, required } of definitions) {
    const value = query[name];
    
    const isMissing = value === undefined || value === null;
    
    if (isMissing) {
      if (required) {
        messages.push(`${name} is required`);
      } else {
        // Parameter is optional and missing - no validation needed
      }
    } else {
      const isValid =
        (type === 'string' && typeof value === 'string' && value.trim().length > 0) ||
        (type === 'number' && !isNaN(Number(value))) ||
        (type === 'boolean' && typeof value === 'boolean');
      
      if (!isValid) {
        const descriptor =
          type === 'string'
            ? 'a non-empty string'
            : type === 'number'
            ? 'a number'
            : 'a boolean (true/false)';
        messages.push(`${name} must be ${descriptor}`);
      } else {
        // Parameter is valid - no error message needed
      }
    }
  }
  
  return messages.length ? messages.join('. ') + '.' : null;
}