"""
CrewAI Callback Handler
REUSABLE across all agentic demos
"""
from typing import Callable, Dict

class CrewCallbackHandler:
    """Handler for CrewAI task callbacks"""
    
    def __init__(self, investigation_id: str, update_callback: Callable):
        """
        Initialize callback handler
        
        Args:
            investigation_id: UUID for this investigation
            update_callback: Function to call with updates (investigation_id, agent_id, event_type, data)
        """
        self.investigation_id = investigation_id
        self.update_callback = update_callback
        self.agent_task_map: Dict[str, str] = {}
    
    def register_task_to_agent(self, task_description: str, agent_id: str):
        """
        Register mapping between task description and agent ID
        Needed because CrewAI doesn't automatically track which agent owns which task
        
        Args:
            task_description: First 50 chars of task description
            agent_id: Agent identifier (e.g., 'data_ingestion')
        """
        task_key = task_description[:50].strip()
        self.agent_task_map[task_key] = agent_id
        print(f"[CallbackHandler] Registered task '{task_key}' to agent '{agent_id}'")
    
    def task_callback(self, task_output):
        """
        Called by CrewAI when each task completes
        This is the critical integration point!
        
        Args:
            task_output: CrewAI TaskOutput object
        """
        try:
            # Extract task information
            task_description = str(task_output.description) if hasattr(task_output, 'description') else ''
            task_result = str(task_output.raw) if hasattr(task_output, 'raw') else ''
            
            # Map task to agent
            task_key = task_description[:50].strip()
            agent_id = self.agent_task_map.get(task_key)
            
            if not agent_id:
                print(f"[CallbackHandler] WARNING: No agent mapped for task '{task_key}'")
                return
            
            print(f"[CallbackHandler] Task completed for agent '{agent_id}'")
            
            # Call update callback
            self.update_callback(
                self.investigation_id,
                agent_id,
                'task_complete',
                {
                    'task_name': task_description[:100],
                    'output': task_result[:500]
                }
            )
            
        except Exception as e:
            print(f"[CallbackHandler] Error in task_callback: {str(e)}")