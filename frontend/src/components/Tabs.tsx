/**
 * Tabs Component for Navigation
 */
import React from 'react';

export type TabValue = 'overview' | 'demo';

interface Tab {
  id: TabValue;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  activeTab: TabValue;
  onTabChange: (tab: TabValue) => void;
  tabs: Tab[];
}

export default function Tabs({ activeTab, onTabChange, tabs }: TabsProps) {
  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <nav className="flex gap-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex items-center gap-2 py-4 px-1 border-b-2 font-semibold text-sm transition-colors
                ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.icon && <span className="w-5 h-5">{tab.icon}</span>}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}