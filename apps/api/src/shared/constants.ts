export const AUDIT_ACTIONS = {
  USER_REGISTER: "user.register",
  USER_LOGIN: "user.login",
  USER_LOGOUT: "user.logout",
  USER_LOGOUT_ALL: "user.logout_all",
  USER_REVOKE_SESSION: "user.revoke_session",
  USER_VERIFY_EMAIL: "user.verify_email",
  USER_FORGOT_PASSWORD: "user.forgot_password",
  USER_RESET_PASSWORD: "user.reset_password",
  USER_UPDATE_PROFILE: "user.update_profile",
  USER_DELETE_ACCOUNT: "user.delete_account",
  ADMIN_SUSPEND_USER: "admin.suspend_user",
  ADMIN_UNSUSPEND_USER: "admin.unsuspend_user",
  ADMIN_DELETE_USER: "admin.delete_user",
} as const;

export const AUDIT_ENTITY_TYPES = {
  USER: "user",
  SESSION: "session",
  CLIENT: "client",
} as const;

export const AUDIT_STATUSES = {
  SUCCESS: "success",
  FAILURE: "failure",
} as const;
