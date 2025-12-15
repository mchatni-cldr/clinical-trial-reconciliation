"""
Status tracking models for agent execution
REUSABLE across all agentic demos
"""
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class StatusEnum(str, Enum):
    """Status values for investigations and agents"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETE = "complete"
    ERROR = "error"

class AgentTask(BaseModel):
    """Individual task completed by an agent"""
    task_name: str
    completed_at: datetime
    output_preview: Optional[str] = None  # First 200 chars of output

class AgentStatus(BaseModel):
    """Status of a single agent in the crew"""
    agent_id: str
    agent_name: str
    status: StatusEnum
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    tasks_completed: List[AgentTask] = []
    current_activity: Optional[str] = None
    error_message: Optional[str] = None

class InvestigationStatus(BaseModel):
    """Overall status of the reconciliation investigation"""
    investigation_id: str
    status: StatusEnum
    started_at: datetime
    completed_at: Optional[datetime] = None
    agents: List[AgentStatus]
    final_report: Optional[str] = None
    error_message: Optional[str] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }