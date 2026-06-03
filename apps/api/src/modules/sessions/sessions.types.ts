export interface SessionListItem {
  id: string;
  deviceName: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  isCurrent: boolean;
  lastActiveAt: string | null;
  createdAt: string;
}

export interface RefreshTokenPayload {
  refreshToken: string;
}
