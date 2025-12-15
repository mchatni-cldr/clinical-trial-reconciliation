"""
Clinical Trial Payment Reconciliation Agent Definitions
"""
from crewai import Agent, Task
from typing import List

def create_data_ingestion_agent(tools: List) -> Agent:
    """Agent responsible for loading and validating payment data"""
    return Agent(
        role='Clinical Trial Data Analyst',
        goal='Load and validate payment data from multiple sources ensuring data quality and completeness',
        backstory="""You are a meticulous data analyst with 10 years of experience in clinical 
        trial operations. You understand the complexities of multi-site trial data and are expert 
        at identifying data quality issues early. You know that clean data is the foundation of 
        accurate reconciliation.""",
        tools=tools,
        verbose=True,
        allow_delegation=False
    )

def create_reconciliation_agent(tools: List) -> Agent:
    """Agent responsible for matching payments to visits"""
    return Agent(
        role='Payment Reconciliation Specialist',
        goal='Match every patient visit to corresponding payments and identify mismatches with precision',
        backstory="""You are a certified clinical trial accountant with expertise in ICH-GCP 
        guidelines and site payment processes. You've reconciled over 200 clinical trials and 
        have a sharp eye for detecting duplicate payments, missing invoices, and billing errors. 
        You understand that even small discrepancies can indicate larger systemic issues.""",
        tools=tools,
        verbose=True,
        allow_delegation=False
    )

def create_contract_compliance_agent(tools: List) -> Agent:
    """Agent responsible for validating payments against contracts"""
    return Agent(
        role='Contract Compliance Officer',
        goal='Ensure all payments strictly adhere to site contract terms and identify overcharges or undercharges',
        backstory="""You are a contract specialist with legal training and 15 years in clinical 
        research contracting. You know that site contracts are binding agreements and that payment 
        deviations can lead to audit findings, disputes, and regulatory issues. You meticulously 
        verify every payment against contracted rates.""",
        tools=tools,
        verbose=True,
        allow_delegation=False
    )

def create_budget_analysis_agent(tools: List) -> Agent:
    """Agent responsible for budget monitoring and forecasting"""
    return Agent(
        role='Financial Controller',
        goal='Monitor budget health, calculate burn rates, and forecast potential overruns before they become critical',
        backstory="""You are a financial analyst specializing in clinical trial budgets. You've 
        managed budgets exceeding $100M and understand that proactive financial monitoring prevents 
        costly surprises. You excel at identifying trends early and providing actionable 
        recommendations to keep trials on financial track.""",
        tools=tools,
        verbose=True,
        allow_delegation=False
    )

def create_report_generation_agent(tools: List) -> Agent:
    """Agent responsible for synthesizing findings into executive report"""
    return Agent(
        role='Executive Report Writer',
        goal='Synthesize all findings into a clear, actionable executive report prioritized by financial impact',
        backstory="""You are a senior clinical operations executive with MBA training. You've 
        presented to C-suite leadership and understand they need concise, prioritized insights 
        with clear action items. You excel at translating complex financial data into strategic 
        recommendations that drive decision-making.""",
        tools=tools,
        verbose=True,
        allow_delegation=False
    )

# Task Definitions
def create_data_ingestion_task(agent: Agent) -> Task:
    """Task for loading and validating data"""
    return Task(
        description="""Load all clinical trial payment data from the data sources and validate completeness.
        
        Your specific responsibilities:
        1. Load site contracts, patient visits, payments made, and budget allocations
        2. Validate data schemas and identify any missing or corrupted records
        3. Calculate summary statistics (number of sites, patients, visits, payments)
        4. Flag any data quality issues that could impact reconciliation
        5. Prepare the data for downstream analysis
        
        Use the DataValidationTool to perform these checks efficiently.
        Return a concise summary of data loaded and any quality concerns.""",
        agent=agent,
        expected_output="Summary of data loaded with statistics and any data quality issues identified"
    )

def create_reconciliation_task(agent: Agent) -> Task:
    """Task for reconciling visits to payments"""
    return Task(
        description="""Reconcile all patient visits against payments made to identify discrepancies.
        
        Your specific responsibilities:
        1. Match each completed patient visit to a corresponding payment record
        2. Identify visits that were completed but never paid (missing payments)
        3. Identify payments made without corresponding visits (potential duplicates or errors)
        4. Identify payments made for screen failures (should not be paid per protocol)
        5. Calculate the total financial impact of all discrepancies
        
        Use the ReconciliationTool to perform efficient matching across thousands of records.
        Focus on HIGH IMPACT issues - prioritize by dollar amount.""",
        agent=agent,
        expected_output="List of all payment-visit mismatches with financial impact and priority levels"
    )

def create_contract_compliance_task(agent: Agent) -> Task:
    """Task for validating payment amounts against contracts"""
    return Task(
        description="""Validate that all payment amounts match the contracted rates for each site.
        
        Your specific responsibilities:
        1. Compare actual payment amounts against contracted rates for each visit type
        2. Identify overcharges (site billed more than contract allows)
        3. Identify undercharges (site billed less than contract specifies)
        4. Flag payments in incorrect currencies
        5. Calculate total overpayment and underpayment amounts
        
        Use the ContractComplianceTool to efficiently validate thousands of payments.
        Even small rate deviations multiplied across many visits become significant.""",
        agent=agent,
        expected_output="List of contract compliance violations with overpayment/underpayment amounts"
    )

def create_budget_analysis_task(agent: Agent) -> Task:
    """Task for analyzing budget health and forecasting"""
    return Task(
        description="""Analyze budget utilization and forecast potential overruns.
        
        Your specific responsibilities:
        1. Calculate actual spend vs. allocated budget for each site
        2. Identify sites significantly over or under budget
        3. Calculate average cost per patient and per visit type
        4. Project remaining trial costs based on enrollment trajectory
        5. Identify budget risk areas that need immediate attention
        
        Use the BudgetAnalysisTool to perform complex budget calculations.
        Focus on sites with >20% variance - these need immediate action.""",
        agent=agent,
        expected_output="Budget health analysis with variance report and spending forecast"
    )

def create_report_generation_task(agent: Agent) -> Task:
    """Task for creating executive summary report"""
    return Task(
        description="""Synthesize all findings into a prioritized executive report.
        
        Your specific responsibilities:
        1. Summarize the TOP 10 most critical issues by financial impact
        2. Categorize issues by type (missing payments, duplicates, contract violations, budget risks)
        3. Provide clear recommendations for each major issue category
        4. Highlight any systemic patterns (e.g., specific sites with recurring problems)
        5. Include an executive summary with total financial exposure
        
        Use the ReportGenerationTool to compile findings from all previous analyses.
        Make it ACTIONABLE - what should leadership do first?""",
        agent=agent,
        expected_output="Executive report with prioritized findings, financial impact, and actionable recommendations"
    )