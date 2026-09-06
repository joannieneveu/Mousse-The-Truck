/**
 * Safe JSON fetch utility that never throws on non-JSON (HTML 413, 502, 504) responses.
 */
export async function safeFetchJson<T = any>(
  url: string,
  options?: RequestInit
): Promise<{ ok: boolean; status: number; data?: T; error?: string }> {
  try {
    const res = await fetch(url, options);
    const contentType = (res.headers.get('content-type') || '').toLowerCase();

    if (contentType.includes('application/json')) {
      try {
        const json = await res.json();
        if (!res.ok) {
          return {
            ok: false,
            status: res.status,
            data: json,
            error: json?.error || json?.message || `Request failed with status ${res.status}`
          };
        }
        return { ok: true, status: res.status, data: json };
      } catch (parseErr: any) {
        return {
          ok: false,
          status: res.status,
          error: `Failed to parse response from server: ${parseErr.message}`
        };
      }
    }

    // Server returned HTML or other non-JSON response (e.g., 413, 502, 504 from Nginx or Vite fallback)
    const text = await res.text();
    let errorMessage = `Server responded with status ${res.status}`;

    if (res.status === 413 || text.includes('413') || text.toLowerCase().includes('request entity too large')) {
      errorMessage = 'Photos or payload too large (413). Please upload fewer or smaller images.';
    } else if (res.status === 502 || res.status === 503 || res.status === 504) {
      errorMessage = 'The server is temporarily busy or reconnecting. Please retry in a few moments.';
    } else if (res.status === 405) {
      errorMessage = 'The hosting server does not support POST requests on this domain (405). Using direct email dispatch fallback.';
    } else if (res.status === 404) {
      errorMessage = 'The requested journal entry or API endpoint was not found on the server (404).';
    } else if (res.status === 403) {
      errorMessage = 'Admin authorization required. Only Joannie or Barton can modify this entry.';
    } else if (!res.ok) {
      errorMessage = `Server error (${res.status}).`;
    }

    return { ok: false, status: res.status, error: errorMessage };
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      error: err.message || 'Network error occurred while connecting to the server.'
    };
  }
}
