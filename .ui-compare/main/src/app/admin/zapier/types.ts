export interface ZapierAutomationRow {
  id: string;
  zap_key: string;
  zap_name: string;
  trigger_app?: string | null;
  trigger_event?: string | null;
  action_app?: string | null;
  action_event?: string | null;
  related_module?: string | null;
  status: string;
  requires_approval: boolean;
  sends_external_message: boolean;
  handles_parent_child_data: boolean;
  phi_risk_level: string;
  last_tested_at?: string | null;
  last_run_at?: string | null;
  error_log?: string | null;
  owner?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}
