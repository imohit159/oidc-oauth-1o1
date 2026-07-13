import { useState, useCallback, useEffect } from "react";
import {
  clientService,
  type OidcClient,
  type CreateClientPayload,
  type UpdateClientPayload,
} from "@/services/client.service";

export function useClients() {
  const [clients, setClients] = useState<OidcClient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clientService.listClients();
      setClients(data || []);
      return data;
    } catch (e: any) {
      const msg = e.message || "Failed to load clients.";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const createClient = useCallback(async (payload: CreateClientPayload) => {
    setActionLoading(true);
    try {
      const result = await clientService.createClient(payload);
      return result;
    } catch (e: any) {
      throw new Error(e.message || "Failed to create client application.");
    } finally {
      setActionLoading(false);
    }
  }, []);

  const updateClient = useCallback(
    async (clientId: string, payload: UpdateClientPayload) => {
      setActionLoading(true);
      try {
        const result = await clientService.updateClient(clientId, payload);
        return result;
      } catch (e: any) {
        throw new Error(e.message || "Failed to update client application.");
      } finally {
        setActionLoading(false);
      }
    },
    [],
  );

  const deleteClient = useCallback(async (clientId: string) => {
    setActionLoading(true);
    try {
      await clientService.deleteClient(clientId);
    } catch (e: any) {
      throw new Error(e.message || "Failed to delete client.");
    } finally {
      setActionLoading(false);
    }
  }, []);

  const rotateSecret = useCallback(async (clientId: string) => {
    setActionLoading(true);
    try {
      const result = await clientService.rotateSecret(clientId);
      return result;
    } catch (e: any) {
      throw new Error(e.message || "Failed to rotate secret.");
    } finally {
      setActionLoading(false);
    }
  }, []);

  return {
    clients,
    loading,
    error,
    actionLoading,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
    rotateSecret,
  };
}

export function useClientDetails(clientId: string) {
  const [client, setClient] = useState<OidcClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClient = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clientService.getClient(clientId);
      setClient(data);
      return data;
    } catch (e: any) {
      const msg = e.message || "Failed to load client details.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    if (clientId) {
      fetchClient();
    }
  }, [clientId, fetchClient]);

  return {
    client,
    loading,
    error,
    refetch: fetchClient,
  };
}
