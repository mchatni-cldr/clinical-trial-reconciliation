"""
CrewAI Setup with task_callback for Clinical Trial Payment Reconciliation
"""
from crewai import Crew, Process, LLM
from agents.agent_definitions import (
    create_data_ingestion_agent,
    create_reconciliation_agent,
    create_contract_compliance_agent,
    create_budget_analysis_agent,
    create_report_generation_agent,
    create_data_ingestion_task,
    create_reconciliation_task,
    create_contract_compliance_task,
    create_budget_analysis_task,
    create_report_generation_task
)
from agents.tools import (
    DataValidationTool,
    ReconciliationTool,
    ContractComplianceTool,
    BudgetAnalysisTool,
    ReportGenerationTool,
    set_global_data
)
from utils.callbacks import CrewCallbackHandler
from typing import Callable
import os

def create_reconciliation_crew(investigation_id: str, update_callback: Callable, data_dict: dict):
    """
    Create the crew for clinical trial payment reconciliation
    
    Args:
        investigation_id: UUID for tracking this investigation
        update_callback: Function to call when status updates occur
        data_dict: Dictionary containing all data (contracts, visits, payments, budgets)
    """
    
    # Set global data that all tools can access
    set_global_data(data_dict)
    
    # Initialize callback handler
    callback_handler = CrewCallbackHandler(investigation_id, update_callback)
    
    # Configure Claude Sonnet 4.5 via LiteLLM
    llm = LLM(
        model="claude-sonnet-4-20250514",
        api_key=os.getenv('ANTHROPIC_API_KEY')
    )
    
    # Create tools
    data_validation_tool = DataValidationTool()
    reconciliation_tool = ReconciliationTool()
    contract_compliance_tool = ContractComplianceTool()
    budget_analysis_tool = BudgetAnalysisTool()
    report_generation_tool = ReportGenerationTool()
    
    # Create agents with LLM
    data_agent = create_data_ingestion_agent([data_validation_tool])
    data_agent.llm = llm
    
    reconciliation_agent = create_reconciliation_agent([reconciliation_tool])
    reconciliation_agent.llm = llm
    
    contract_agent = create_contract_compliance_agent([contract_compliance_tool])
    contract_agent.llm = llm
    
    budget_agent = create_budget_analysis_agent([budget_analysis_tool])
    budget_agent.llm = llm
    
    report_agent = create_report_generation_agent([report_generation_tool])
    report_agent.llm = llm
    
    # Create tasks
    data_task = create_data_ingestion_task(data_agent)
    reconciliation_task = create_reconciliation_task(reconciliation_agent)
    contract_task = create_contract_compliance_task(contract_agent)
    budget_task = create_budget_analysis_task(budget_agent)
    report_task = create_report_generation_task(report_agent)
    
    # Register task-to-agent mappings for UI updates
    callback_handler.register_task_to_agent(
        data_task.description[:50].strip(), 
        "data_ingestion"
    )
    callback_handler.register_task_to_agent(
        reconciliation_task.description[:50].strip(),
        "reconciliation"
    )
    callback_handler.register_task_to_agent(
        contract_task.description[:50].strip(),
        "contract_compliance"
    )
    callback_handler.register_task_to_agent(
        budget_task.description[:50].strip(),
        "budget_analysis"
    )
    callback_handler.register_task_to_agent(
        report_task.description[:50].strip(),
        "report_generation"
    )
    
    # Create crew with task_callback
    crew = Crew(
        agents=[data_agent, reconciliation_agent, contract_agent, budget_agent, report_agent],
        tasks=[data_task, reconciliation_task, contract_task, budget_task, report_task],
        process=Process.sequential,
        verbose=True,
        task_callback=callback_handler.task_callback  # CRITICAL!
    )
    
    return crew