import { useState, useCallback } from "react";

export function useWelcomeBanner() {
  const getGreeting = useCallback(() => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good morning";
    if (hr < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  return { getGreeting };
}

export function useDiscoveryEndpoint(discoveryUrl: string) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(discoveryUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [discoveryUrl]);

  return {
    copied,
    isOpen,
    setIsOpen,
    handleCopy,
  };
}

export function useRecentClients() {
  const getRelativeTime = useCallback((dateString: string) => {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  const getInitials = useCallback((name: string) => {
    return name.slice(0, 2).toUpperCase();
  }, []);

  return {
    getRelativeTime,
    getInitials,
  };
}
