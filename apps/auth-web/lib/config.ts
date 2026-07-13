const getApiUrl = (): string => {
  if (typeof window !== "undefined") {
    return (window as any).env?.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
};

export const config = Object.freeze({
  API_URL: getApiUrl(),
});
