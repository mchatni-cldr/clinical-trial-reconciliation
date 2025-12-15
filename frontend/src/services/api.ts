/**
 * API Service for Clinical Trial Payment Reconciliation
 * REUSABLE with minimal changes
 */
import axios from 'axios';
import { InvestigationStatus } from '../types/agent.types';

const API_BASE_URL = 'http://localhost:5000';

export const apiService = {
  /**
   * Start a new payment reconciliation investigation
   */
  startReconciliation: async (): Promise<{ investigation_id: string }> => {
    const response = await axios.post(`${API_BASE_URL}/api/reconciliation/start`);
    return response.data;
  },

  /**
   * Get current status of an investigation
   */
  getInvestigationStatus: async (investigationId: string): Promise<InvestigationStatus> => {
    const response = await axios.get(
      `${API_BASE_URL}/api/reconciliation/${investigationId}/status`
    );
    return response.data;
  },

  /**
   * Get final report for completed investigation
   */
  getFinalReport: async (investigationId: string): Promise<{ report: string }> => {
    const response = await axios.get(
      `${API_BASE_URL}/api/reconciliation/${investigationId}/report`
    );
    return response.data;
  },

  /**
   * Poll investigation status with automatic updates
   * Stops polling when investigation is complete or errored
   */
  pollInvestigationStatus: async (
    investigationId: string,
    onUpdate: (status: InvestigationStatus) => void,
    intervalMs: number = 4000
  ): Promise<void> => {
    const poll = async () => {
      try {
        const status = await apiService.getInvestigationStatus(investigationId);
        onUpdate(status);

        // Stop polling if complete or error
        if (status.status === 'complete' || status.status === 'error') {
          return;
        }

        // Continue polling
        setTimeout(poll, intervalMs);
      } catch (error) {
        console.error('Error polling investigation status:', error);
        // Continue polling even on error (might be temporary network issue)
        setTimeout(poll, intervalMs);
      }
    };

    await poll();
  },
};