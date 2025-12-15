"""
Clinical Trial Payment Reconciliation Tools
These tools do the heavy pandas processing to minimize token usage
"""
from crewai.tools import BaseTool
from typing import Dict, List, Any, Optional
import pandas as pd
from pydantic import BaseModel, Field

# Global data storage - will be set by crew_setup
_GLOBAL_DATA: Dict[str, pd.DataFrame] = {}

def set_global_data(data_dict: Dict[str, pd.DataFrame]):
    """Set global data that all tools can access"""
    global _GLOBAL_DATA
    _GLOBAL_DATA = data_dict

class DataValidationTool(BaseTool):
    name: str = "Data Validation Tool"
    description: str = "Loads and validates all clinical trial payment data, returning summary statistics only"
    
    def _run(self) -> str:
        """Load and validate data, return only summary statistics"""
        try:
            contracts_df = _GLOBAL_DATA['contracts']
            visits_df = _GLOBAL_DATA['visits']
            payments_df = _GLOBAL_DATA['payments']
            budgets_df = _GLOBAL_DATA['budgets']
            
            # Calculate summary statistics
            summary = {
                'total_sites': len(contracts_df),
                'total_patients': visits_df['patient_id'].nunique(),
                'total_visits': len(visits_df),
                'completed_visits': len(visits_df[visits_df['status'] == 'completed']),
                'screen_failures': len(visits_df[visits_df['status'] == 'screen_failure']),
                'total_payments': len(payments_df),
                'total_paid_amount': f"${payments_df['amount_usd'].sum():,.2f}",
                'total_budget': f"${budgets_df['allocated_budget_usd'].sum():,.2f}",
            }
            
            # Check for data quality issues
            issues = []
            
            # Check for missing critical fields
            if contracts_df.isnull().any().any():
                issues.append("Some site contracts have missing rate information")
            
            if visits_df['visit_date'].isnull().any():
                issues.append(f"{visits_df['visit_date'].isnull().sum()} visits have missing dates")
            
            if payments_df['payment_date'].isnull().any():
                issues.append(f"{payments_df['payment_date'].isnull().sum()} payments have missing dates")
            
            # Build response
            response = f"""DATA VALIDATION COMPLETE
            
Summary Statistics:
- Sites: {summary['total_sites']}
- Patients: {summary['total_patients']}
- Total Visits: {summary['total_visits']} ({summary['completed_visits']} completed, {summary['screen_failures']} screen failures)
- Total Payments Recorded: {summary['total_payments']}
- Total Amount Paid: {summary['total_paid_amount']}
- Total Budget Allocated: {summary['total_budget']}

Data Quality Issues: {len(issues)}
"""
            if issues:
                response += "\n".join([f"- {issue}" for issue in issues])
            else:
                response += "- No critical data quality issues detected"
            
            return response
            
        except Exception as e:
            return f"Error validating data: {str(e)}"


class ReconciliationTool(BaseTool):
    name: str = "Payment Reconciliation Tool"
    description: str = "Matches visits to payments and identifies discrepancies efficiently using pandas"
    
    def _run(self) -> str:
        """Reconcile visits to payments, return only summary of discrepancies"""
        try:
            visits_df = _GLOBAL_DATA['visits']
            payments_df = _GLOBAL_DATA['payments']
            
            # Filter to completed visits only (screen failures shouldn't be paid)
            completed_visits = visits_df[visits_df['status'] == 'completed'].copy()
            
            # Merge visits with payments
            merged = pd.merge(
                completed_visits,
                payments_df,
                on=['site_id', 'patient_id', 'visit_type'],
                how='outer',
                indicator=True,
                suffixes=('_visit', '_payment')
            )
            
            # Identify discrepancies
            unpaid_visits = merged[merged['_merge'] == 'left_only']
            unmatched_payments = merged[merged['_merge'] == 'right_only']
            
            # Check for screen failure payments (should NOT be paid)
            screen_failures = visits_df[visits_df['status'] == 'screen_failure']
            sf_payments = pd.merge(
                screen_failures,
                payments_df,
                on=['site_id', 'patient_id', 'visit_type'],
                how='inner'
            )
            
            # Find potential duplicates (same site, patient, visit type paid twice)
            duplicates = payments_df[payments_df.duplicated(
                subset=['site_id', 'patient_id', 'visit_type'], 
                keep=False
            )]
            
            # Calculate financial impact (use average payment amount for unpaid visits)
            avg_payment = payments_df['amount_usd'].mean()
            unpaid_amount = len(unpaid_visits) * avg_payment
            duplicate_amount = duplicates['amount_usd'].sum() / 2  # Divide by 2 since each duplicate counted twice
            sf_amount = sf_payments['amount_usd'].sum()
            
            # Build concise summary
            response = f"""RECONCILIATION COMPLETE

Critical Discrepancies Found:

1. UNPAID VISITS: {len(unpaid_visits)} completed visits with no matching payment
   - Estimated financial impact: ${unpaid_amount:,.2f}
   - Top affected sites: {unpaid_visits['site_id'].value_counts().head(3).to_dict()}

2. UNMATCHED PAYMENTS: {len(unmatched_payments)} payments with no corresponding visit record
   - Could indicate duplicates or data entry errors
   - Total amount: ${unmatched_payments['amount_usd'].sum():,.2f}
   - Top affected sites: {unmatched_payments['site_id'].value_counts().head(3).to_dict()}

3. SCREEN FAILURE PAYMENTS: {len(sf_payments)} payments made for screen failures (protocol violation)
   - Total overpaid: ${sf_amount:,.2f}
   - Affected sites: {sf_payments['site_id'].unique().tolist()}

4. POTENTIAL DUPLICATES: {len(duplicates)//2} suspected duplicate payments
   - Estimated duplicate amount: ${duplicate_amount:,.2f}
   - Sites with duplicates: {duplicates['site_id'].unique().tolist()}

TOTAL FINANCIAL EXPOSURE: ${unpaid_amount + sf_amount + duplicate_amount:,.2f}
"""
            return response
            
        except Exception as e:
            return f"Error during reconciliation: {str(e)}"


class ContractComplianceTool(BaseTool):
    name: str = "Contract Compliance Tool"
    description: str = "Validates payment amounts against contracted rates for all sites"
    
    def _run(self) -> str:
        """Check payment compliance with contracts, return only violations"""
        try:
            contracts_df = _GLOBAL_DATA['contracts']
            payments_df = _GLOBAL_DATA['payments']
            
            # Merge payments with contracts
            merged = pd.merge(
                payments_df,
                contracts_df,
                on='site_id',
                how='left'
            )
            
            # Determine expected amount based on visit type
            def get_expected_amount(row):
                visit_type = row['visit_type']
                if visit_type == 'screening':
                    return row['screening_fee_usd']
                elif visit_type == 'baseline':
                    return row['baseline_fee_usd']
                elif visit_type == 'month_3':
                    return row['month3_fee_usd']
                elif visit_type == 'month_6':
                    return row['month6_fee_usd']
                elif visit_type == 'month_12':
                    return row['month12_fee_usd']
                elif visit_type == 'closeout':
                    return row['closeout_fee_usd']
                return 0
            
            merged['expected_amount'] = merged.apply(get_expected_amount, axis=1)
            merged['variance'] = merged['amount_usd'] - merged['expected_amount']
            merged['variance_pct'] = (merged['variance'] / merged['expected_amount'] * 100).round(2)
            
            # Find violations (more than $1 difference to account for rounding)
            violations = merged[abs(merged['variance']) > 1].copy()
            
            overcharges = violations[violations['variance'] > 0]
            undercharges = violations[violations['variance'] < 0]
            
            # Build summary
            response = f"""CONTRACT COMPLIANCE CHECK COMPLETE

Total Payments Checked: {len(merged)}
Contract Violations Found: {len(violations)} ({len(violations)/len(merged)*100:.1f}%)

OVERCHARGES (Site Billed Too Much):
- Count: {len(overcharges)}
- Total Overpaid: ${overcharges['variance'].sum():,.2f}
- Average Overcharge: ${overcharges['variance'].mean():,.2f}
- Top offending sites: {overcharges.groupby('site_id')['variance'].sum().nlargest(3).to_dict()}

UNDERCHARGES (Site Billed Too Little):
- Count: {len(undercharges)}
- Total Underpaid: ${abs(undercharges['variance'].sum()):,.2f}
- Average Undercharge: ${abs(undercharges['variance'].mean()):,.2f}
- Top affected sites: {undercharges.groupby('site_id')['variance'].sum().nsmallest(3).to_dict()}

NET FINANCIAL IMPACT: ${violations['variance'].sum():,.2f} (positive = we overpaid)

RECOMMENDATION: Review site billing processes, especially at sites with systematic over/undercharging patterns.
"""
            return response
            
        except Exception as e:
            return f"Error checking contract compliance: {str(e)}"


class BudgetAnalysisTool(BaseTool):
    name: str = "Budget Analysis Tool"
    description: str = "Analyzes budget utilization and forecasts spending"
    
    def _run(self) -> str:
        """Analyze budget health, return summary and forecast"""
        try:
            budgets_df = _GLOBAL_DATA['budgets']
            payments_df = _GLOBAL_DATA['payments']
            visits_df = _GLOBAL_DATA['visits']
            
            # Calculate actual spend per site
            site_spend = payments_df.groupby('site_id')['amount_usd'].sum().reset_index()
            site_spend.columns = ['site_id', 'actual_spend']
            
            # Merge with budgets
            budget_analysis = pd.merge(budgets_df, site_spend, on='site_id', how='left')
            budget_analysis['actual_spend'] = budget_analysis['actual_spend'].fillna(0)
            budget_analysis['variance'] = budget_analysis['actual_spend'] - budget_analysis['allocated_budget_usd']
            budget_analysis['variance_pct'] = (budget_analysis['variance'] / budget_analysis['allocated_budget_usd'] * 100).round(2)
            budget_analysis['utilization_pct'] = (budget_analysis['actual_spend'] / budget_analysis['allocated_budget_usd'] * 100).round(2)
            
            # Identify problem sites (>20% variance)
            overbudget_sites = budget_analysis[budget_analysis['variance_pct'] > 20].sort_values('variance', ascending=False)
            underbudget_sites = budget_analysis[budget_analysis['variance_pct'] < -20].sort_values('variance')
            
            # Calculate cost per patient metrics
            completed_visits = visits_df[visits_df['status'] == 'completed']
            patients_per_site = completed_visits.groupby('site_id')['patient_id'].nunique().reset_index()
            patients_per_site.columns = ['site_id', 'patient_count']
            
            cost_per_patient = pd.merge(site_spend, patients_per_site, on='site_id', how='left')
            cost_per_patient['cost_per_patient'] = cost_per_patient['actual_spend'] / cost_per_patient['patient_count']
            avg_cost_per_patient = cost_per_patient['cost_per_patient'].mean()
            
            # Build response
            response = f"""BUDGET ANALYSIS COMPLETE

Overall Budget Health:
- Total Allocated: ${budgets_df['allocated_budget_usd'].sum():,.2f}
- Total Spent: ${site_spend['actual_spend'].sum():,.2f}
- Overall Variance: ${budget_analysis['variance'].sum():,.2f} ({budget_analysis['variance'].sum()/budgets_df['allocated_budget_usd'].sum()*100:.1f}%)
- Average Site Utilization: {budget_analysis['utilization_pct'].mean():.1f}%

CRITICAL ALERTS - Over Budget Sites ({len(overbudget_sites)}):
"""
            for _, site in overbudget_sites.head(5).iterrows():
                response += f"\n- Site {site['site_id']}: ${site['variance']:,.2f} over ({site['variance_pct']:.1f}% over budget)"
            
            response += f"""

Under-Spending Sites ({len(underbudget_sites)}):
"""
            for _, site in underbudget_sites.head(3).iterrows():
                response += f"\n- Site {site['site_id']}: ${abs(site['variance']):,.2f} under ({abs(site['variance_pct']):.1f}% under budget)"
            
            response += f"""

Cost Efficiency Metrics:
- Average Cost Per Patient: ${avg_cost_per_patient:,.2f}
- Highest Cost Site: ${cost_per_patient['cost_per_patient'].max():,.2f} per patient
- Lowest Cost Site: ${cost_per_patient['cost_per_patient'].min():,.2f} per patient

FORECAST: Based on current burn rate, sites showing >20% overspend will require budget amendments.
Recommend immediate review of overbudget sites for billing accuracy and enrollment projections.
"""
            return response
            
        except Exception as e:
            return f"Error analyzing budget: {str(e)}"


class ReportGenerationTool(BaseTool):
    name: str = "Report Generation Tool"
    description: str = "Compiles all findings into executive summary with prioritized action items"
    
    class ArgsSchema(BaseModel):
        findings_summary: str = Field(..., description="Summary of all findings from previous agents")
    
    args_schema: type[BaseModel] = ArgsSchema
    
    def _run(self, findings_summary: str) -> str:
        """Generate executive report from all findings"""
        try:
            # Extract key metrics from the findings for structured output
            visits_df = _GLOBAL_DATA['visits']
            payments_df = _GLOBAL_DATA['payments']
            
            # Get the actual numbers
            completed_visits = visits_df[visits_df['status'] == 'completed']
            
            # Unpaid visits
            merged = pd.merge(
                completed_visits,
                payments_df,
                on=['site_id', 'patient_id', 'visit_type'],
                how='outer',
                indicator=True
            )
            unpaid_visits = merged[merged['_merge'] == 'left_only']
            unpaid_count = len(unpaid_visits)
            avg_payment = payments_df['amount_usd'].mean()
            unpaid_amount = unpaid_count * avg_payment
            
            # Duplicates
            duplicates = payments_df[payments_df.duplicated(
                subset=['site_id', 'patient_id', 'visit_type'], 
                keep=False
            )]
            duplicates_count = len(duplicates) // 2
            duplicate_amount = duplicates['amount_usd'].sum() / 2
            
            # Screen failures
            screen_failures = visits_df[visits_df['status'] == 'screen_failure']
            sf_payments = pd.merge(screen_failures, payments_df, 
                                   on=['site_id', 'patient_id', 'visit_type'], 
                                   how='inner')
            sf_count = len(sf_payments)
            sf_amount = sf_payments['amount_usd'].sum()
            
            # Total exposure
            total_exposure = unpaid_amount + duplicate_amount + sf_amount
            
            # Contract violations
            contracts_df = _GLOBAL_DATA['contracts']
            merged_contracts = pd.merge(payments_df, contracts_df, on='site_id', how='left')
            
            def get_expected_amount(row):
                visit_type = row['visit_type']
                if visit_type == 'screening':
                    return row['screening_fee_usd']
                elif visit_type == 'baseline':
                    return row['baseline_fee_usd']
                elif visit_type == 'month_3':
                    return row['month3_fee_usd']
                elif visit_type == 'month_6':
                    return row['month6_fee_usd']
                elif visit_type == 'month_12':
                    return row['month12_fee_usd']
                elif visit_type == 'closeout':
                    return row['closeout_fee_usd']
                return 0
            
            merged_contracts['expected_amount'] = merged_contracts.apply(get_expected_amount, axis=1)
            merged_contracts['variance'] = merged_contracts['amount_usd'] - merged_contracts['expected_amount']
            violations = merged_contracts[abs(merged_contracts['variance']) > 1]
            violations_count = len(violations)
            
            # Budget issues
            budgets_df = _GLOBAL_DATA['budgets']
            site_spend = payments_df.groupby('site_id')['amount_usd'].sum().reset_index()
            site_spend.columns = ['site_id', 'actual_spend']
            budget_analysis = pd.merge(budgets_df, site_spend, on='site_id', how='left')
            budget_analysis['actual_spend'] = budget_analysis['actual_spend'].fillna(0)
            budget_analysis['variance'] = budget_analysis['actual_spend'] - budget_analysis['allocated_budget_usd']
            budget_analysis['variance_pct'] = (budget_analysis['variance'] / budget_analysis['allocated_budget_usd'] * 100)
            overbudget_sites = budget_analysis[budget_analysis['variance_pct'] > 20]
            overbudget_count = len(overbudget_sites)
            
            report = f"""
═══════════════════════════════════════════════════════════════
CLINICAL TRIAL PAYMENT RECONCILIATION - EXECUTIVE REPORT
Phase III Diabetes Study (NCT12345)
═══════════════════════════════════════════════════════════════

EXECUTIVE SUMMARY
-----------------
This automated reconciliation has identified significant payment discrepancies
and budget concerns requiring immediate management attention.

KEY METRICS
-----------
Total Financial Exposure: ${total_exposure:,.2f}
Unpaid Visits: {unpaid_count} (${unpaid_amount:,.2f})
Duplicate Payments: {duplicates_count}
Screen Failure Payments: {sf_count}
Contract Violations: {violations_count}
Sites Over Budget: {overbudget_count}

DETAILED FINDINGS
-----------------
{findings_summary}

RECOMMENDED ACTIONS (Priority Order)
═══════════════════════════════════════════════════════════════

🔴 IMMEDIATE (This Week):
1. Investigate {duplicates_count} duplicate payments and initiate recovery process
2. Review {sf_count} screen failure payments for protocol compliance
3. Contact {overbudget_count} overbudget sites for enrollment forecast update

🟡 SHORT-TERM (This Month):
4. Process {unpaid_count} unpaid visit invoices to maintain site relationships
5. Audit {violations_count} sites with contract rate violations
6. Review and update site payment procedures if needed

🟢 ONGOING:
7. Implement automated reconciliation checks monthly
8. Enhance site training on proper invoicing procedures
9. Consider budget reallocation from underperforming sites

═══════════════════════════════════════════════════════════════
Report generated by AI Payment Reconciliation System
Contact: clinical-finance@example.com for questions
═══════════════════════════════════════════════════════════════
"""
            return report
            
        except Exception as e:
            return f"Error generating report: {str(e)}"