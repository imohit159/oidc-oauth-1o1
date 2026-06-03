import type { User } from "../auth/types.js";

export interface UserResource {
  user: User;
}

export interface SessionResource {
  id: string;
  device_name?: string;
  user_agent?: string;
  ip_address?: string;
  is_current: boolean;
  last_active_at?: string;
  created_at: string;
}

export interface ClientResource {
  id: string;
  name: string;
  description?: string;
  client_type: string;
  redirect_uris: string[];
  created_at: string;
}
