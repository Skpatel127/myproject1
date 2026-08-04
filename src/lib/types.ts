export type UserRole = "owner" | "management" | "employee" | "client";

export type ClientHealth = "healthy" | "attention" | "at_risk" | "critical";

export type LeadStage =
  | "new"
  | "contacted"
  | "follow_up_required"
  | "meeting_scheduled"
  | "requirement_collected"
  | "proposal_sent"
  | "negotiation"
  | "won"
  | "lost"
  | "on_hold";

export type TaskStatus =
  | "not_started"
  | "assigned"
  | "in_progress"
  | "waiting_internal_review"
  | "waiting_client"
  | "revision_required"
  | "blocked"
  | "completed"
  | "cancelled"
  | "overdue";

export type TaskPriority = "low" | "normal" | "high" | "urgent" | "critical";

export type ContentStage =
  | "idea"
  | "research"
  | "script"
  | "internal_review"
  | "client_approval"
  | "shoot_planning"
  | "shoot_completed"
  | "editing"
  | "internal_qc"
  | "client_review"
  | "revision"
  | "final_approval"
  | "scheduling"
  | "published";

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  department: string | null;
  client_id: string | null;
  active: boolean;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  industry: string | null;
  account_manager_id: string | null;
  health: ClientHealth;
  contract_start: string | null;
  contract_end: string | null;
  monthly_deliverables: number | null;
  notes: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  source: string | null;
  stage: LeadStage;
  expected_value: number | null;
  probability: number | null;
  follow_up_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  project_id: string | null;
  client_id: string | null;
  title: string;
  description: string | null;
  assigned_to: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  created_at: string;
}

export interface ContentItem {
  id: string;
  client_id: string;
  title: string;
  content_type: string | null;
  platform: string | null;
  stage: ContentStage;
  priority: TaskPriority;
  publish_date: string | null;
  created_at: string;
}
