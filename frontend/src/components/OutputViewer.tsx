/**
 * Output Viewer Component - Clinical Trial Payment Reconciliation
 * Polished executive report with structured sections
 */
import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Calendar,
  Building2
} from 'lucide-react';

interface OutputViewerProps {
  report: string;
  investigationId: string;
}

export default function OutputViewer({ report, investigationId }: OutputViewerProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['summary']));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleDownload = () => {
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reconciliation-report-${investigationId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Parse the report to extract key metrics
  const parseReport = () => {
    // Debug: log the report to console
    console.log('Parsing report:', report);
    
    // Try multiple parsing strategies
    
    // Strategy 1: Look for KEY METRICS section
    const keyMetricsMatch = report.match(/KEY METRICS[:\s]*\n[-=]+\s*\n(.*?)(?:\n\n|\nDETAILED)/s);
    
    if (keyMetricsMatch) {
      const metricsSection = keyMetricsMatch[1];
      console.log('Found KEY METRICS section:', metricsSection);
      
      const totalExposureMatch = metricsSection.match(/Total Financial Exposure[:\s]*\$([0-9,]+\.?\d*)/i);
      const unpaidMatch = metricsSection.match(/Unpaid Visits[:\s]*(\d+)[^\d]*\$([0-9,]+\.?\d*)/i);
      const duplicatesMatch = metricsSection.match(/Duplicate Payments[:\s]*(\d+)/i);
      const sfMatch = metricsSection.match(/Screen Failure Payments[:\s]*(\d+)/i);
      const violationsMatch = metricsSection.match(/Contract Violations[:\s]*(\d+)/i);
      const overbudgetMatch = metricsSection.match(/Sites Over Budget[:\s]*(\d+)/i);
      
      const metrics = {
        unpaidCount: unpaidMatch ? parseInt(unpaidMatch[1]) : 0,
        unpaidAmount: unpaidMatch ? unpaidMatch[2] : '0.00',
        duplicatesCount: duplicatesMatch ? parseInt(duplicatesMatch[1]) : 0,
        sfCount: sfMatch ? parseInt(sfMatch[1]) : 0,
        totalExposure: totalExposureMatch ? totalExposureMatch[1] : '0.00',
        violationsCount: violationsMatch ? parseInt(violationsMatch[1]) : 0,
        overbudgetCount: overbudgetMatch ? parseInt(overbudgetMatch[1]) : 0
      };
      
      console.log('Parsed metrics from KEY METRICS:', metrics);
      
      // Check if we got any real data
      if (metrics.totalExposure !== '0.00' || metrics.unpaidCount > 0) {
        return metrics;
      }
    }
    
    console.log('KEY METRICS parsing failed or returned zeros, trying comprehensive fallback...');
    
    // Strategy 2: Parse from the detailed sections (most reliable)
    // Look for specific patterns in the report body
    
    // Unpaid visits
    const unpaidMatches = report.match(/(\d+)\s+completed visits with no matching payment/i);
    const unpaidCount = unpaidMatches ? parseInt(unpaidMatches[1]) : 0;
    
    const unpaidAmountMatches = report.match(/(?:Estimated financial impact|financial exposure)[:\s]*\$([0-9,]+\.?\d*)/i);
    const unpaidAmount = unpaidAmountMatches ? unpaidAmountMatches[1] : '0.00';
    
    // Duplicates
    const duplicatesMatches = report.match(/(\d+)(?:\/2)?\s+suspected duplicate payments/i) || 
                             report.match(/POTENTIAL DUPLICATES[:\s]*(\d+)/i);
    const duplicatesCount = duplicatesMatches ? parseInt(duplicatesMatches[1]) : 0;
    
    // Screen failures
    const sfPaymentsMatches = report.match(/(\d+)\s+payments made for screen failures/i) ||
                              report.match(/SCREEN FAILURE PAYMENTS[:\s]*(\d+)/i);
    const sfCount = sfPaymentsMatches ? parseInt(sfPaymentsMatches[1]) : 0;
    
    // Total exposure
    const totalExposureMatches = report.match(/TOTAL FINANCIAL EXPOSURE[:\s]*\$([0-9,]+\.?\d*)/i);
    const totalExposure = totalExposureMatches ? totalExposureMatches[1] : '0.00';
    
    // Contract violations
    const violationsMatches = report.match(/(?:Contract Violations Found|Contract Violations)[:\s]*(\d+)/i);
    const violationsCount = violationsMatches ? parseInt(violationsMatches[1]) : 0;
    
    // Overbudget sites
    const overbudgetMatches = report.match(/(?:Over Budget Sites|CRITICAL ALERTS[^\n]*)\s*[\(\:]?\s*(\d+)/i);
    const overbudgetCount = overbudgetMatches ? parseInt(overbudgetMatches[1]) : 0;
    
    const fallbackMetrics = {
      unpaidCount,
      unpaidAmount,
      duplicatesCount,
      sfCount,
      totalExposure,
      violationsCount,
      overbudgetCount
    };
    
    console.log('Fallback parsed metrics:', fallbackMetrics);
    return fallbackMetrics;
  };

  const metrics = parseReport();

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-xl p-8 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="bg-white/20 p-4 rounded-lg backdrop-blur">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Executive Reconciliation Report
              </h1>
              <p className="text-blue-100 text-lg">
                Phase III Diabetes Study • NCT12345
              </p>
              <div className="flex items-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>50 Sites Analyzed</span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-white text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-red-600" />
            <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded-full">
              CRITICAL
            </span>
          </div>
          <p className="text-3xl font-bold text-red-900 mb-1">
            ${metrics.totalExposure}
          </p>
          <p className="text-sm text-red-700 font-medium">Total Financial Exposure</p>
        </div>

        <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="w-8 h-8 text-orange-600" />
            <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
              HIGH
            </span>
          </div>
          <p className="text-3xl font-bold text-orange-900 mb-1">
            {metrics.unpaidCount}
          </p>
          <p className="text-sm text-orange-700 font-medium">Unpaid Visits</p>
        </div>

        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-900 mb-1">
            {metrics.violationsCount}
          </p>
          <p className="text-sm text-purple-700 font-medium">Contract Violations</p>
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-yellow-900 mb-1">
            {metrics.overbudgetCount}
          </p>
          <p className="text-sm text-yellow-700 font-medium">Sites Over Budget</p>
        </div>
      </div>

      {/* Issue Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border-2 border-orange-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-bold text-gray-900">Unpaid Visits</h3>
          </div>
          <p className="text-2xl font-bold text-orange-900 mb-2">
            ${metrics.unpaidAmount}
          </p>
          <p className="text-sm text-gray-600">
            {metrics.unpaidCount} completed visits without payment
          </p>
        </div>

        <div className="bg-white border-2 border-red-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="font-bold text-gray-900">Duplicate Payments</h3>
          </div>
          <p className="text-2xl font-bold text-red-900 mb-2">
            {metrics.duplicatesCount}
          </p>
          <p className="text-sm text-gray-600">
            Suspected duplicate payment entries
          </p>
        </div>

        <div className="bg-white border-2 border-purple-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <AlertCircle className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900">Protocol Violations</h3>
          </div>
          <p className="text-2xl font-bold text-purple-900 mb-2">
            {metrics.sfCount}
          </p>
          <p className="text-sm text-gray-600">
            Screen failures incorrectly paid
          </p>
        </div>
      </div>

      {/* Detailed Findings - Expandable Sections */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Detailed Analysis</h2>
        </div>

        {/* Expandable Section: Full Report */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection('fullreport')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-900">Complete Report Details</span>
            </div>
            {expandedSections.has('fullreport') ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          {expandedSections.has('fullreport') && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed bg-white p-4 rounded-lg border border-gray-200">
                {report}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl shadow-lg border-2 border-red-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-red-600 p-2 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Immediate Action Required</h2>
        </div>
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-4 border-l-4 border-red-500">
            <div className="flex items-start gap-3">
              <div className="bg-red-100 rounded-full p-1 mt-0.5">
                <span className="text-red-700 font-bold text-sm px-2">1</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Investigate Duplicate Payments</p>
                <p className="text-sm text-gray-600">Initiate recovery process for {metrics.duplicatesCount} duplicate payment entries</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border-l-4 border-orange-500">
            <div className="flex items-start gap-3">
              <div className="bg-orange-100 rounded-full p-1 mt-0.5">
                <span className="text-orange-700 font-bold text-sm px-2">2</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Review Screen Failure Payments</p>
                <p className="text-sm text-gray-600">Audit {metrics.sfCount} protocol violations for screen failure payments</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border-l-4 border-yellow-500">
            <div className="flex items-start gap-3">
              <div className="bg-yellow-100 rounded-full p-1 mt-0.5">
                <span className="text-yellow-700 font-bold text-sm px-2">3</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Contact Overbudget Sites</p>
                <p className="text-sm text-gray-600">Request enrollment forecasts from {metrics.overbudgetCount} sites exceeding budget</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white rounded-xl shadow border-2 border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-semibold text-gray-900">Report Generated By</p>
              <p className="text-xs text-gray-600">AI Payment Reconciliation System</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-semibold text-gray-900">Investigation ID</p>
              <p className="text-xs text-gray-600 font-mono">{investigationId.slice(0, 18)}...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}