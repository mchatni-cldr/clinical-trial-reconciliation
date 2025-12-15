/**
 * Agent Status Card Component - Enhanced Version
 * Improved visual hierarchy and information density
 */
import React from 'react';
import { AgentStatus, StatusEnum } from '../types/agent.types';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Database,
  GitCompare,
  FileCheck,
  TrendingUp,
  FileText,
  Zap,
} from 'lucide-react';

interface AgentStatusCardProps {
  agent: AgentStatus;
}

// Map agent IDs to icons
const agentIcons: Record<string, React.ReactNode> = {
  data_ingestion: <Database className="w-6 h-6" />,
  reconciliation: <GitCompare className="w-6 h-6" />,
  contract_compliance: <FileCheck className="w-6 h-6" />,
  budget_analysis: <TrendingUp className="w-6 h-6" />,
  report_generation: <FileText className="w-6 h-6" />,
};

// Map agent IDs to colors
const agentColors: Record<string, string> = {
  data_ingestion: 'blue',
  reconciliation: 'purple',
  contract_compliance: 'green',
  budget_analysis: 'orange',
  report_generation: 'red',
};

export default function AgentStatusCard({ agent }: AgentStatusCardProps) {
  const color = agentColors[agent.agent_id] || 'gray';

  const getStatusIcon = () => {
    switch (agent.status) {
      case StatusEnum.PENDING:
        return <Clock className="w-5 h-5 text-gray-400" />;
      case StatusEnum.RUNNING:
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case StatusEnum.COMPLETE:
        return <CheckCircle2 className={`w-5 h-5 text-${color}-600`} />;
      case StatusEnum.ERROR:
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusBadge = () => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide";
    
    switch (agent.status) {
      case StatusEnum.PENDING:
        return <span className={`${baseClasses} bg-gray-100 text-gray-600`}>Queued</span>;
      case StatusEnum.RUNNING:
        return (
          <span className={`${baseClasses} bg-blue-100 text-blue-700 flex items-center gap-1`}>
            <Zap className="w-3 h-3" />
            Active
          </span>
        );
      case StatusEnum.COMPLETE:
        return <span className={`${baseClasses} bg-${color}-100 text-${color}-700`}>Complete</span>;
      case StatusEnum.ERROR:
        return <span className={`${baseClasses} bg-red-100 text-red-700`}>Failed</span>;
    }
  };

  const getCardClasses = () => {
    const baseClasses = 'rounded-xl border-2 p-6 transition-all duration-300';
    
    if (agent.status === StatusEnum.PENDING) {
      return `${baseClasses} bg-white border-gray-200 opacity-60 hover:opacity-80`;
    } else if (agent.status === StatusEnum.RUNNING) {
      return `${baseClasses} bg-gradient-to-br from-${color}-50 to-white border-${color}-300 shadow-2xl animate-pulse-glow ring-4 ring-${color}-100`;
    } else if (agent.status === StatusEnum.COMPLETE) {
      return `${baseClasses} bg-white border-${color}-200 shadow-md hover:shadow-lg`;
    } else {
      return `${baseClasses} bg-red-50 border-red-300 shadow-lg`;
    }
  };

  const getIconClasses = () => {
    const baseClasses = "p-3 rounded-lg transition-all duration-300";
    
    if (agent.status === StatusEnum.RUNNING) {
      return `${baseClasses} bg-${color}-100 text-${color}-600 animate-bounce-slow shadow-md`;
    } else if (agent.status === StatusEnum.COMPLETE) {
      return `${baseClasses} bg-${color}-100 text-${color}-600`;
    }
    return `${baseClasses} bg-gray-100 text-gray-400`;
  };

  // Calculate duration if completed
  const getDuration = () => {
    if (agent.started_at && agent.completed_at) {
      const start = new Date(agent.started_at);
      const end = new Date(agent.completed_at);
      const durationMs = end.getTime() - start.getTime();
      const seconds = Math.floor(durationMs / 1000);
      const minutes = Math.floor(seconds / 60);
      
      if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
      }
      return `${seconds}s`;
    }
    return null;
  };

  const duration = getDuration();

  return (
    <div className={getCardClasses()}>
      {/* Header Section */}
      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={getIconClasses()}>
            {agentIcons[agent.agent_id] || <Database className="w-6 h-6" />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-base mb-1 truncate">
              {agent.agent_name}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
              {agent.current_activity}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {getStatusIcon()}
          <div className="flex-shrink-0">
            {getStatusBadge()}
          </div>
        </div>
      </div>

      {/* Progress indicator for running state */}
      {agent.status === StatusEnum.RUNNING && (
        <div className="mb-4">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full bg-${color}-500 animate-progress`}></div>
          </div>
        </div>
      )}

      {/* Tasks completed section */}
      {agent.tasks_completed.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Tasks Completed
            </p>
            <span className={`text-xs font-bold text-${color}-600 bg-${color}-100 px-2 py-0.5 rounded-full`}>
              {agent.tasks_completed.length}
            </span>
          </div>
          {agent.tasks_completed.map((task, index) => (
            <div
              key={index}
              className={`bg-gradient-to-r from-${color}-50 to-white rounded-lg p-3 text-sm border border-${color}-200 hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="font-semibold text-gray-800 flex-1 leading-snug">
                  {task.task_name}
                </p>
                <CheckCircle2 className={`w-4 h-4 text-${color}-500 flex-shrink-0 mt-0.5`} />
              </div>
              {task.output_preview && (
                <p className="text-gray-600 text-xs mt-2 line-clamp-2 leading-relaxed">
                  {task.output_preview}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Error message */}
      {agent.status === StatusEnum.ERROR && agent.error_message && (
        <div className="mt-4 bg-red-100 border-l-4 border-red-500 rounded-r p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-900 mb-1">Error Occurred</p>
              <p className="text-sm text-red-800">{agent.error_message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer with timing info */}
      {(agent.completed_at || agent.started_at) && (
        <div className={`mt-4 pt-4 border-t ${agent.status === StatusEnum.COMPLETE ? `border-${color}-200` : 'border-gray-200'}`}>
          <div className="flex items-center justify-between text-xs">
            {duration && (
              <div className="flex items-center gap-1 text-gray-600">
                <Clock className="w-3 h-3" />
                <span className="font-medium">Duration: {duration}</span>
              </div>
            )}
            {agent.completed_at && (
              <span className="text-gray-500">
                {new Date(agent.completed_at).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}