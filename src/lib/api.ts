const API_URL = process.env.NEXT_PUBLIC_API_URL;

type ApiRequestOptions = RequestInit & {
  auth?: boolean;
};

type ErrorBody = {
  detail?: unknown;
  details?: unknown;
  error?: unknown;
  errors?: Record<string, unknown>;
  message?: unknown;
};

function friendlyServerError(endpoint: string) {
  if (endpoint === "/auth/signup" || endpoint === "/auth/resend-signup-otp") {
    return "The account was submitted, but the server could not send the verification email. Please try again later or contact support.";
  }

  if (endpoint === "/auth/forgot-password") {
    return "We could not send the verification code to your email. Please try again later or contact support.";
  }

  if (endpoint === "/auth/reset-password") {
    return "Could not reset your password. Please check your verification code and try again.";
  }

  return "";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  if (!API_URL) {
    throw new Error("Missing NEXT_PUBLIC_API_URL environment variable");
  }

  const { auth, headers, ...requestOptions } = options;
  const shouldSendAuth = auth ?? !endpoint.startsWith("/auth/");
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
      ...(shouldSendAuth && token && {
        Authorization: `Bearer ${token}`,
      }),
    },
    ...requestOptions,
  });

  const text = await res.text();
  let data: unknown = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const body = typeof data === "object" && data ? (data as ErrorBody) : null;
    const msg = body?.message ?? body?.detail;
    const detail =
      Array.isArray(msg) ? msg.join(". ") : typeof msg === "string" ? msg : "";
    const detailList =
      Array.isArray(body?.details) || Array.isArray(body?.detail)
        ? ((body?.details ?? body?.detail) as unknown[]).join(". ")
        : "";
    const errors =
      body?.errors && typeof body.errors === "object"
        ? Object.entries(body.errors)
            .map(([key, value]) =>
              `${key}: ${Array.isArray(value) ? value.join(", ") : String(value)}`,
            )
            .join("; ")
        : "";
    const error = typeof body?.error === "string" ? body.error : "";
    const fallback = typeof data === "string" ? data : "";
    const serverHint = res.status >= 500 ? friendlyServerError(endpoint) : "";
    const combined = (
      serverHint
        ? [serverHint]
        : [detail, detailList, errors, error, fallback]
    )
      .filter(Boolean)
      .join(" - ");

    throw new Error(combined || `Request failed with status ${res.status}`);
  }

  return data as T;
}

export const providerLogin = async (data: {
  email: string;
  password: string;
}) => {
  const res = await fetch(
    "https://shaka-backend-a2dc.onrender.com/api/auth/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Login failed");
  }

  return res.json();
};
