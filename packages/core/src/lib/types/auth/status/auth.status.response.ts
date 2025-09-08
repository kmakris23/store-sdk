export interface AuthStatusResponse {
  active: boolean;
  flag_defined: boolean;
  flag_enabled: boolean;
  secret_defined: boolean;
  secret_length: number;
  inactive_reason?: 'missing_flag' | 'disabled_flag' | 'missing_secret' | null;
  endpoints: Record<string, boolean>;
  version: string;
  timestamp: number;
}
