/**
 * Main Dashboard Component with Tabs - Clinical Trial Payment Reconciliation
 */
import React, { useState } from 'react';
import { InvestigationStatus, StatusEnum } from '../types/agent.types';
import { apiService } from '../services/api';
import AgentStatusCard from './AgentStatusCard';
import OutputViewer from './OutputViewer';
import OverviewTab from './OverviewTab';
import Tabs, { TabValue } from './Tabs';
import { Activity, PlayCircle, RotateCcw, BookOpen, Zap } from 'lucide-react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabValue>('overview');
  const [investigation, setInvestigation] = useState<InvestigationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartReconciliation = async () => {
    // Switch to demo tab when starting
    setActiveTab('demo');
    
    try {
      setIsLoading(true);
      setError(null);
      setInvestigation(null);

      // Start investigation
      const { investigation_id } = await apiService.startReconciliation();

      // Start polling for status updates
      await apiService.pollInvestigationStatus(investigation_id, (status) => {
        setInvestigation(status);
      });

      setIsLoading(false);
    } catch (err) {
      console.error('Error starting reconciliation:', err);
      setError('Failed to start reconciliation. Please check the backend is running.');
      setIsLoading(false);
    }
  };

  const handleNewAnalysis = () => {
    setInvestigation(null);
    setError(null);
  };

  const isComplete = investigation?.status === StatusEnum.COMPLETE;
  const hasError = investigation?.status === StatusEnum.ERROR;

  const tabs = [
    { id: 'overview' as TabValue, label: 'Overview', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'demo' as TabValue, label: 'Live Demo', icon: <Zap className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Clinical Trial Payment Reconciliation AI
              </h1>
              <p className="text-gray-600 mt-1">
                Phase III Diabetes Study (NCT12345) • Automated Payment Analysis
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <OverviewTab onStartDemo={handleStartReconciliation} />
        )}

        {activeTab === 'demo' && (
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Start Button */}
            {!investigation && !isLoading && (
              <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 p-12 text-center">
                <div className="max-w-2xl mx-auto">
                  <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <PlayCircle className="w-10 h-10 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Ready to Analyze Payment Data
                  </h2>
                  <p className="text-gray-600 mb-8">
                    This AI system will analyze 50 clinical trial sites, 500+ patients, and 2000+ 
                    visit records to identify payment discrepancies, contract violations, and budget issues.
                  </p>
                  <button
                    onClick={handleStartReconciliation}
                    className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                  >
                    Start Reconciliation Analysis
                  </button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && !investigation && (
              <div className="bg-white rounded-lg shadow-lg border-2 border-blue-200 p-12 text-center">
                <div className="animate-spin w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-6"></div>
                <p className="text-gray-600 text-lg">Initializing AI agents...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-6">
                <p className="text-red-800 font-semibold">Error: {error}</p>
              </div>
            )}

            {/* Agent Execution Pipeline */}
            {investigation && !isComplete && (
              <div className="mb-8">
                <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 p-6 mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Agent Execution Pipeline
                  </h2>
                  <div className="flex items-center gap-4">
                    {investigation.agents.map((agent, index) => (
                      <React.Fragment key={agent.agent_id}>
                        <div className="flex-1">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              agent.status === StatusEnum.COMPLETE
                                ? 'bg-green-500'
                                : agent.status === StatusEnum.RUNNING
                                ? 'bg-blue-500 animate-pulse'
                                : 'bg-gray-200'
                            }`}
                          ></div>
                          <p className="text-xs text-gray-600 mt-2 text-center">
                            {agent.agent_name.replace(' Agent', '')}
                          </p>
                        </div>
                        {index < investigation.agents.length - 1 && (
                          <div className="text-gray-300">→</div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Agent Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {investigation.agents.map((agent) => (
                    <AgentStatusCard key={agent.agent_id} agent={agent} />
                  ))}
                </div>
              </div>
            )}

            {/* Final Report */}
            {isComplete && investigation.final_report && (
              <div className="space-y-6">
                <OutputViewer
                  report={investigation.final_report}
                  investigationId={investigation.investigation_id}
                />

                {/* New Analysis Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleNewAnalysis}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Run New Analysis
                  </button>
                </div>
              </div>
            )}

            {/* Error in Investigation */}
            {hasError && investigation.error_message && (
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-8 text-center">
                <h3 className="text-xl font-bold text-red-900 mb-2">
                  Investigation Error
                </h3>
                <p className="text-red-700">{investigation.error_message}</p>
                <button
                  onClick={handleNewAnalysis}
                  className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}