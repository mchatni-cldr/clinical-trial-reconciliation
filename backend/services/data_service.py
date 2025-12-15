"""
Mock Data Generation Service for Clinical Trial Payment Reconciliation
Generates realistic data with intentional discrepancies
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

class ClinicalTrialDataService:
    """Service to generate mock clinical trial payment data"""
    
    def __init__(self, seed=42):
        """Initialize with random seed for reproducibility"""
        np.random.seed(seed)
        random.seed(seed)
        self.start_date = datetime(2024, 1, 1)
    
    def generate_all_data(self):
        """Generate all mock data with seeded discrepancies"""
        contracts_df = self._generate_site_contracts()
        visits_df = self._generate_patient_visits()
        payments_df = self._generate_payments(visits_df, contracts_df)
        budgets_df = self._generate_budgets(contracts_df)
        
        return {
            'contracts': contracts_df,
            'visits': visits_df,
            'payments': payments_df,
            'budgets': budgets_df
        }
    
    def _generate_site_contracts(self):
        """Generate 50 site contracts with varying rates"""
        countries = ['USA', 'Germany', 'UK', 'France', 'Canada', 'Australia', 'Japan', 'Spain', 'Italy', 'Netherlands']
        
        sites = []
        for i in range(1, 51):
            country = random.choice(countries)
            
            # Base rates vary by country (higher in US/Japan, lower in EU)
            if country in ['USA', 'Japan', 'Australia']:
                base_multiplier = 1.0
            elif country in ['UK', 'Canada']:
                base_multiplier = 0.85
            else:
                base_multiplier = 0.75
            
            sites.append({
                'site_id': f'SITE_{i:03d}',
                'site_name': f'{country} Medical Center {i}',
                'country': country,
                'screening_fee_usd': round(1500 * base_multiplier, 2),
                'baseline_fee_usd': round(3000 * base_multiplier, 2),
                'month3_fee_usd': round(2000 * base_multiplier, 2),
                'month6_fee_usd': round(2000 * base_multiplier, 2),
                'month12_fee_usd': round(2500 * base_multiplier, 2),
                'closeout_fee_usd': round(3500 * base_multiplier, 2)
            })
        
        return pd.DataFrame(sites)
    
    def _generate_patient_visits(self):
        """Generate 500 patients with ~2000 visits"""
        visits = []
        visit_types = ['screening', 'baseline', 'month_3', 'month_6', 'month_12', 'closeout']
        
        patient_id = 1
        for site_num in range(1, 51):
            site_id = f'SITE_{site_num:03d}'
            
            # Each site has 8-12 patients
            num_patients = random.randint(8, 12)
            
            for p in range(num_patients):
                current_patient_id = f'P-{patient_id:04d}'
                patient_id += 1
                
                # 15% screen failures
                is_screen_failure = random.random() < 0.15
                
                # Screening visit (everyone has this)
                visit_date = self.start_date + timedelta(days=random.randint(0, 180))
                visits.append({
                    'patient_id': current_patient_id,
                    'site_id': site_id,
                    'visit_type': 'screening',
                    'visit_date': visit_date,
                    'status': 'screen_failure' if is_screen_failure else 'completed'
                })
                
                if is_screen_failure:
                    continue  # Screen failures don't have more visits
                
                # Baseline visit
                visit_date = visit_date + timedelta(days=random.randint(3, 14))
                visits.append({
                    'patient_id': current_patient_id,
                    'site_id': site_id,
                    'visit_type': 'baseline',
                    'visit_date': visit_date,
                    'status': 'completed'
                })
                
                # Month 3 visit (90% complete it)
                if random.random() < 0.90:
                    visit_date = visit_date + timedelta(days=random.randint(85, 95))
                    visits.append({
                        'patient_id': current_patient_id,
                        'site_id': site_id,
                        'visit_type': 'month_3',
                        'visit_date': visit_date,
                        'status': 'completed'
                    })
                
                # Month 6 visit (80% complete it)
                if random.random() < 0.80:
                    visit_date = visit_date + timedelta(days=random.randint(85, 95))
                    visits.append({
                        'patient_id': current_patient_id,
                        'site_id': site_id,
                        'visit_type': 'month_6',
                        'visit_date': visit_date,
                        'status': 'completed'
                    })
                
                # Month 12 visit (70% complete it)
                if random.random() < 0.70:
                    visit_date = visit_date + timedelta(days=random.randint(175, 185))
                    visits.append({
                        'patient_id': current_patient_id,
                        'site_id': site_id,
                        'visit_type': 'month_12',
                        'visit_date': visit_date,
                        'status': 'completed'
                    })
                
                # Closeout visit (65% complete it)
                if random.random() < 0.65:
                    visit_date = visit_date + timedelta(days=random.randint(30, 60))
                    visits.append({
                        'patient_id': current_patient_id,
                        'site_id': site_id,
                        'visit_type': 'closeout',
                        'visit_date': visit_date,
                        'status': 'completed'
                    })
        
        return pd.DataFrame(visits)
    
    def _generate_payments(self, visits_df, contracts_df):
        """Generate payments with intentional discrepancies"""
        payments = []
        payment_id = 1
        
        # Get completed visits
        completed_visits = visits_df[visits_df['status'] == 'completed'].copy()
        
        # Generate payments for most completed visits (but not all - creates discrepancy)
        for _, visit in completed_visits.iterrows():
            # 5% of visits don't get paid (DISCREPANCY: missing payments)
            if random.random() < 0.05:
                continue
            
            site_id = visit['site_id']
            visit_type = visit['visit_type']
            
            # Get contracted rate
            contract = contracts_df[contracts_df['site_id'] == site_id].iloc[0]
            
            if visit_type == 'screening':
                expected_amount = contract['screening_fee_usd']
            elif visit_type == 'baseline':
                expected_amount = contract['baseline_fee_usd']
            elif visit_type == 'month_3':
                expected_amount = contract['month3_fee_usd']
            elif visit_type == 'month_6':
                expected_amount = contract['month6_fee_usd']
            elif visit_type == 'month_12':
                expected_amount = contract['month12_fee_usd']
            elif visit_type == 'closeout':
                expected_amount = contract['closeout_fee_usd']
            
            # 10% of payments have wrong amounts (DISCREPANCY: contract violations)
            if random.random() < 0.10:
                # Randomly overcharge or undercharge by 5-20%
                variance = random.uniform(-0.20, 0.20)
                actual_amount = round(expected_amount * (1 + variance), 2)
            else:
                actual_amount = expected_amount
            
            payment_date = visit['visit_date'] + timedelta(days=random.randint(30, 60))
            
            payments.append({
                'payment_id': f'PAY-{payment_id:05d}',
                'site_id': site_id,
                'patient_id': visit['patient_id'],
                'visit_type': visit_type,
                'amount_usd': actual_amount,
                'payment_date': payment_date,
                'invoice_number': f'INV-{site_id}-{payment_id:05d}'
            })
            payment_id += 1
        
        # Add some duplicate payments (DISCREPANCY: duplicates)
        num_duplicates = 8
        duplicate_payments = random.sample(payments, num_duplicates)
        for dup in duplicate_payments:
            dup_payment = dup.copy()
            dup_payment['payment_id'] = f'PAY-{payment_id:05d}'
            dup_payment['invoice_number'] = f'INV-{dup["site_id"]}-{payment_id:05d}'
            dup_payment['payment_date'] = dup['payment_date'] + timedelta(days=random.randint(1, 30))
            payments.append(dup_payment)
            payment_id += 1
        
        # Add some screen failure payments (DISCREPANCY: shouldn't be paid)
        screen_failures = visits_df[visits_df['status'] == 'screen_failure']
        num_sf_payments = int(len(screen_failures) * 0.08)  # 8% of screen failures wrongly paid
        sf_to_pay = screen_failures.sample(n=num_sf_payments)
        
        for _, sf_visit in sf_to_pay.iterrows():
            site_id = sf_visit['site_id']
            contract = contracts_df[contracts_df['site_id'] == site_id].iloc[0]
            
            payments.append({
                'payment_id': f'PAY-{payment_id:05d}',
                'site_id': site_id,
                'patient_id': sf_visit['patient_id'],
                'visit_type': 'screening',
                'amount_usd': contract['screening_fee_usd'],
                'payment_date': sf_visit['visit_date'] + timedelta(days=random.randint(30, 60)),
                'invoice_number': f'INV-{site_id}-{payment_id:05d}'
            })
            payment_id += 1
        
        return pd.DataFrame(payments)
    
    def _generate_budgets(self, contracts_df):
        """Generate budget allocations per site"""
        budgets = []
        
        for _, contract in contracts_df.iterrows():
            site_id = contract['site_id']
            
            # Budget for 10 patients on average, all visits
            avg_cost_per_patient = (
                contract['screening_fee_usd'] +
                contract['baseline_fee_usd'] +
                contract['month3_fee_usd'] +
                contract['month6_fee_usd'] +
                contract['month12_fee_usd'] +
                contract['closeout_fee_usd']
            )
            
            # Add 10% buffer
            allocated_budget = round(avg_cost_per_patient * 10 * 1.10, 2)
            
            budgets.append({
                'site_id': site_id,
                'allocated_budget_usd': allocated_budget,
                'currency': 'USD'
            })
        
        return pd.DataFrame(budgets)