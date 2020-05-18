/**
 * A wrapper around fetch that throws when the response is an error status
 * @See https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
 */
export const wrappedFetch = async (input: RequestInfo, init?: RequestInit): Promise<Response> =>
  fetch(input, init).then(response => {
    if (response.ok) {
      return response;
    }
    throw new Error(response.statusText);
  });
