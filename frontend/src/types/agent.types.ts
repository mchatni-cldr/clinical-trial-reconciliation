/**
 * Agent and Investigation Status Types
 * REUSABLE across all agentic demos
 */

export enum StatusEnum {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETE = 'complete',
  ERROR = 'error',
}

export interface AgentTask {
  task_name: string;
  completed_at: string;
  output_preview?: string;
}

export interface AgentStatus {
  agent_id: string;
  agent_name: string;
  status: StatusEnum;
  started_at?: string;
  completed_at?: string;
  tasks_completed: AgentTask[];
  current_activity?: string;
  error_message?: string;
}

export interface InvestigationStatus {
  investigation_id: string;
  status: StatusEnum;
  started_at: string;
  completed_at?: string;
  agents: AgentStatus[];
  final_report?: string;
  error_message?: string;
}