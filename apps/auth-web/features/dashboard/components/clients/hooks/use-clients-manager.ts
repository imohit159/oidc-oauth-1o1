import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useClients } from "./use-clients";

export function useClientsManager() {
  const router = useRouter();
  const { clients, loading, error, fetchClients, deleteClient, rotateSecret } =
    useClients();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Created Client Secret reveal state
  const [newClientSecret, setNewClientSecret] = useState<{
    clientId: string;
    clientSecret?: string;
    name: string;
  } | null>(null);

  // UI Utilities
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();

    const pendingReveal = sessionStorage.getItem("pending_client_reveal");
    if (pendingReveal) {
      try {
        const parsed = JSON.parse(pendingReveal);
        setNewClientSecret(parsed);
        sessionStorage.removeItem("pending_client_reveal");
      } catch (e) {
        console.error(e);
      }
    }
  }, [fetchClients]);

  // Copy helper
  const handleCopy = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  // Delete Client
  const handleDelete = useCallback(
    async (clientId: string) => {
      if (
        !confirm(
          "Are you sure you want to delete this application? This action cannot be undone.",
        )
      ) {
        return;
      }

      try {
        await deleteClient(clientId);
        await fetchClients();
      } catch (e: any) {
        alert(e.message || "Failed to delete client.");
      }
    },
    [deleteClient, fetchClients],
  );

  // Regenerate Client Secret
  const handleRegenerateSecret = useCallback(
    async (clientId: string) => {
      if (
        !confirm(
          "Are you sure you want to regenerate the client secret? The old secret will stop working immediately.",
        )
      ) {
        return;
      }

      try {
        const result = await rotateSecret(clientId);
        setNewClientSecret(result);
      } catch (e: any) {
        alert(e.message || "Failed to regenerate secret.");
      }
    },
    [rotateSecret],
  );

  return {
    router,
    clients,
    loading,
    error,
    viewMode,
    setViewMode,
    newClientSecret,
    setNewClientSecret,
    copiedId,
    handleCopy,
    handleDelete,
    handleRegenerateSecret,
    fetchClients,
  };
}
