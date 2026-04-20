const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  if (!API_URL) {
    throw new Error("Missing NEXT_PUBLIC_API_URL environment variable");
  }
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
    },
    ...options,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg = data?.message;
    const detail =
      Array.isArray(msg) ? msg.join(". ") : typeof msg === "string" ? msg : "";
    const errors =
      data?.errors && typeof data.errors === "object"
        ? Object.entries(data.errors as Record<string, unknown>)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`)
            .join("; ")
        : "";
    const combined = [detail, errors].filter(Boolean).join(" — ");
    throw new Error(combined || data?.error || "Something went wrong");
  }

  return data;
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
    }
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Login failed");
  }

  return res.json();
};