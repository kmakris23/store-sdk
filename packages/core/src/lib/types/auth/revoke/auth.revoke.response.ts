export interface AuthRevokeResponse {
  revoked: boolean;
  scope: string;
  new_version: number;
}
