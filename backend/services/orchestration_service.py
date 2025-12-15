"""
Orchestration Service for Clinical Trial Payment Reconciliation
REUSABLE pattern with domain-specific customization
"""
import uuid
import threading
from datetime import datetime
from typing import Dict, Optional
from models.status_model import InvestigationStatus, AgentStatus, AgentTask, StatusEnum
from agents.crew_setup import create_reconciliation_crew
from services.data_service import ClinicalTrialDataService

class ReconciliationOrchestrationService:
    """Service to orchestrate payment reconciliation investigations"""
    
    def __init__(self):
        """Initialize the orchestration service"""
        self.investigations: Dict[str, InvestigationStatus] = {}
        self.data_service = ClinicalTrialDataService()
        
        # Define agent configuration
        self.agent_configs = [
            {
                'agent_id': 'data_ingestion',
                'agent_name': 'Data Ingestion Agent',
                'description': 'Loading and validating payment data'
            },
            {
                'agent_id': 'reconciliation',
                'agent_name': 'Payment Reconciliation Agent',
                'description': 'Matching visits to payments'
            },
            {
                'agent_id': 'contract_compliance',
                'agent_name': 'Contract Compliance Agent',
                'description': 'Validating payment amounts'
            },
            {
                'agent_id': 'budget_analysis',
                'agent_name': 'Budget Analysis Agent',
                'description': 'Analyzing budget health'
            },
            {
                'agent_id': 'report_generation',
                'agent_name': 'Report Generation Agent',
                'description': 'Compiling executive report'
            }
        ]
    
    def start_investigation(self) -> str:
        """
        Start a new payment reconciliation investigation
        Returns investigation_id for tracking
        """
        investigation_id = str(uuid.uuid4())
        
        # Initialize agent statuses
        agents = [
            AgentStatus(
                agent_id=config['agent_id'],
                agent_name=config['agent_name'],
                status=StatusEnum.PENDING,
                current_activity=config['description']
            )
            for config in self.agent_configs
        ]
        
        # Create investigation status
        investigation = InvestigationStatus(
            investigation_id=investigation_id,
            status=StatusEnum.RUNNING,
            started_at=datetime.now(),
            agents=agents
        )
        
        self.investigations[investigation_id] = investigation
        
        # Generate mock data once for this investigation
        data_dict = self.data_service.generate_all_data()
        
        # Start crew execution in background thread
        def run_investigation():
            try:
                # Mark first agent as running
                self._update_status(
                    investigation_id,
                    'data_ingestion',
                    'running',
                    {'message': 'Starting data validation...'}
                )
                
                # Create and run crew
                crew = create_reconciliation_crew(
                    investigation_id,
                    self._update_status,
                    data_dict
                )
                
                result = crew.kickoff()
                
                # Store final report
                self.investigations[investigation_id].final_report = str(result)
                self.investigations[investigation_id].status = StatusEnum.COMPLETE
                self.investigations[investigation_id].completed_at = datetime.now()
                
            except Exception as e:
                print(f"Error in investigation {investigation_id}: {str(e)}")
                self.investigations[investigation_id].status = StatusEnum.ERROR
                self.investigations[investigation_id].error_message = str(e)
                self.investigations[investigation_id].completed_at = datetime.now()
        
        thread = threading.Thread(target=run_investigation, daemon=True)
        thread.start()
        
        return investigation_id
    
    def get_investigation_status(self, investigation_id: str) -> Optional[InvestigationStatus]:
        """Get current status of an investigation"""
        return self.investigations.get(investigation_id)
    
    def _update_status(self, investigation_id: str, agent_id: str, event_type: str, data: Dict):
        """
        Callback function called by CrewCallbackHandler
        Updates investigation status based on agent progress
        """
        investigation = self.investigations.get(investigation_id)
        if not investigation:
            return
        
        # Find the agent
        agent = next((a for a in investigation.agents if a.agent_id == agent_id), None)
        if not agent:
            return
        
        # Update based on event type
        if event_type == 'running':
            agent.status = StatusEnum.RUNNING
            agent.started_at = datetime.now()
            if 'message' in data:
                agent.current_activity = data['message']
        
        elif event_type == 'task_complete':
            # Add completed task
            task = AgentTask(
                task_name=data.get('task_name', 'Task completed'),
                completed_at=datetime.now(),
                output_preview=data.get('output', '')[:200] if data.get('output') else None
            )
            agent.tasks_completed.append(task)
            
            # Mark agent as complete
            agent.status = StatusEnum.COMPLETE
            agent.completed_at = datetime.now()
            agent.current_activity = 'Complete'
            
            # Start next agent if exists
            current_index = next(i for i, a in enumerate(investigation.agents) if a.agent_id == agent_id)
            if current_index + 1 < len(investigation.agents):
                next_agent = investigation.agents[current_index + 1]
                next_agent.status = StatusEnum.RUNNING
                next_agent.started_at = datetime.now()
        
        elif event_type == 'error':
            agent.status = StatusEnum.ERROR
            agent.error_message = data.get('message', 'Unknown error')
            agent.completed_at = datetime.now()