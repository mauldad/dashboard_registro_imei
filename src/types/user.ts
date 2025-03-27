export interface User {
  user_id: string;
  email: string;
  channel: string;
  is_admin: boolean;
  is_operator: boolean;
  is_client: boolean;
  receive_weekly_reports: boolean;
}
