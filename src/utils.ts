/**
 * Utility function to execute promises safely
 *
 * @param promise The promise to be executed
 *
 * @returns A tuple of [error, data] where then first value
 *          is an error if the promise rejected, and the second value
 *          is the result of the promise when successfull
 */
export async function safeCall<T>(
  promise: Promise<T>
): Promise<[undefined, T] | [Error]> {
  return promise
    .then((data) => {
      return [undefined, data] as [undefined, T];
    })
    .catch((error) => {
      return [error];
    });
}

export function birthdateToAge(birthdate: Date): number {
  const ageDiffMs = Date.now() - birthdate.getTime();
  const ageDate = new Date(ageDiffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

export function convertKebabCaseToString(str: string) {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Helper function to handle error messages
 *
 * @param error The error to handle
 * @param ctx An optional object for custom error messages for specific status codes.
 *            If not provided, default messages will be used
 * @returns an error message based on the error status code
 *
 * Example:
 * handleError(error, { 404: 'Custom 404 message' });
 */
export function handleError(error: Error, ctx?: Record<number, string>) {
  const json = extractJsonObject(error.message);
  const status = json?.status;

  if (!json || Object.keys(json).length === 0) {
    return 'Something went wrong. We are looking into it, please try again later.';
  }

  if (!status) {
    return 'Something went wrong. We are looking into it, please try again later.';
  }

  if (ctx && ctx[Number(status)]) {
    return ctx[Number(status)];
  }

  if (status === 404) {
    return 'The requested resource was not found';
  }

  if (status === 403) {
    return 'You do not have permission to access this resource';
  }

  if (status === 401) {
    return 'You are not authenticated. Please log in before trying to view this data.';
  }

  return 'Something went wrong. We are looking into it, please try again later.';
}

/**
 * Returns the first JSON object found in a string.
 * @param inputString the string to search for a JSON object
 * @returns returns JSON object, or null if no object is found
 */
function extractJsonObject(
  inputString: string
): Record<string, unknown> | null {
  try {
    const jsonRegex = /\{[\s\S]*?\}/;

    const match = inputString.match(jsonRegex);

    if (match) {
      const jsonString = match[0];
      return JSON.parse(jsonString);
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return null;
  }
}
