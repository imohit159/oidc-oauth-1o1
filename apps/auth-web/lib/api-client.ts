const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

let authToken: string | null = null;
let onTokenExpired: (() => void) | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const setOnTokenExpired = (callback: () => void) => {
  onTokenExpired = callback;
};

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions extends RequestInit {
  json?: any;
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const url = `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const headers = new Headers(options.headers);
  if (options.json && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Inject Bearer token if present
  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: options.credentials ?? "include", // Ensure session cookies are sent
  };

  if (options.json) {
    config.body = JSON.stringify(options.json);
  }

  let response = await fetch(url, config);

  // Auto-refresh token if 401 is encountered (except during login/refresh endpoints)
  if (
    response.status === 401 &&
    !path.includes("/sessions/refresh") &&
    !path.includes("/identity/login")
  ) {
    try {
      const refreshResponse = await fetch(
        `${API_URL}/api/v1/sessions/refresh`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      if (refreshResponse.ok) {
        const result = await refreshResponse.json();
        const newAccessToken = result?.data?.accessToken;
        if (newAccessToken) {
          setAuthToken(newAccessToken);
          headers.set("Authorization", `Bearer ${newAccessToken}`);
          config.headers = headers;
          // Retry the request
          response = await fetch(url, config);
        }
      } else {
        // Refresh token is invalid/expired
        setAuthToken(null);
        if (onTokenExpired) {
          onTokenExpired();
        }
      }
    } catch (e) {
      setAuthToken(null);
    }
  }

  let result: any;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    result = await response.json();
  } else {
    result = { message: await response.text() };
  }

  if (!response.ok) {
    const errorCode = result?.error?.code || "HTTP_ERROR";
    const errorMessage =
      result?.error?.message ||
      result?.message ||
      `HTTP error ${response.status}`;
    throw new ApiError(response.status, errorCode, errorMessage);
  }

  // The backend ApiResponse.success wraps actual data in .data
  return result?.data as T;
}

export const apiClient = {
  get<T>(path: string, options?: RequestOptions) {
    return request<T>(path, { ...options, method: "GET" });
  },
  post<T>(path: string, json?: any, options?: RequestOptions) {
    return request<T>(path, { ...options, method: "POST", json });
  },
  put<T>(path: string, json?: any, options?: RequestOptions) {
    return request<T>(path, { ...options, method: "PUT", json });
  },
  patch<T>(path: string, json?: any, options?: RequestOptions) {
    return request<T>(path, { ...options, method: "PATCH", json });
  },
  delete<T>(path: string, options?: RequestOptions) {
    return request<T>(path, { ...options, method: "DELETE" });
  },
};
