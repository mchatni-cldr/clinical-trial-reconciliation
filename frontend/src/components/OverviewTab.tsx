/**
 * Overview Tab - Explains the use case and agentic AI approach
 */
import React from 'react';
import {
  AlertTriangle,
  Clock,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Zap,
  Brain,
  Database,
  GitCompare,
  FileCheck,
  FileText,
  Users,
  Target,
  Sparkles,
} from 'lucide-react';

interface OverviewTabProps {
  onStartDemo: () => void;
}

export default function OverviewTab({ onStartDemo }: OverviewTabProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            Powered by Agentic AI
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Clinical Trial Payment Reconciliation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Automate complex payment reconciliation across multiple clinical trial sites 
            using specialized AI agents that work together to identify discrepancies, 
            validate contracts, and provide actionable insights.
          </p>
        </div>

        {/* The Problem Section */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">The Problem</h2>
          </div>
          
          <p className="text-gray-600 text-lg mb-8">
            Clinical trials involve complex payment workflows across dozens of sites, 
            hundreds of patients, and thousands of individual transactions. Manual 
            reconciliation is time-consuming, error-prone, and expensive.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <Clock className="w-8 h-8 text-red-600 mb-3" />
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Time Intensive</h3>
              <p className="text-gray-600">
                Finance teams spend 40-60 hours per month manually matching payments 
                to visits, checking contracts, and reconciling budgets.
              </p>
            </div>

            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
              <DollarSign className="w-8 h-8 text-orange-600 mb-3" />
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Costly Errors</h3>
              <p className="text-gray-600">
                Duplicate payments, missed invoices, and contract violations can cost 
                trials $50K-$200K+ in overpayments and audit findings.
              </p>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
              <TrendingUp className="w-8 h-8 text-yellow-600 mb-3" />
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Scale Challenges</h3>
              <p className="text-gray-600">
                As trials grow (50+ sites, 500+ patients), manual processes break down. 
                Reconciliation backlogs can reach 6-8 weeks.
              </p>
            </div>

            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
              <Users className="w-8 h-8 text-purple-600 mb-3" />
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Inconsistent Quality</h3>
              <p className="text-gray-600">
                Different team members use different approaches, leading to inconsistent 
                findings and missed discrepancies.
              </p>
            </div>
          </div>
        </div>

        {/* Why Agentic AI Section */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-xl p-8 mb-12 text-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white/20 p-3 rounded-lg backdrop-blur">
              <Brain className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold">Why Agentic AI?</h2>
          </div>

          <p className="text-blue-100 text-lg mb-8">
            Traditional automation can't handle the complexity and judgment required for 
            clinical trial reconciliation. Agentic AI uses specialized agents that reason, 
            analyze, and collaborate—just like a team of human experts.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
              <Zap className="w-8 h-8 mb-3" />
              <h3 className="font-bold mb-2 text-lg">Autonomous Decision-Making</h3>
              <p className="text-blue-100 text-sm">
                Agents independently analyze data, identify patterns, and flag issues 
                without human intervention.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
              <Target className="w-8 h-8 mb-3" />
              <h3 className="font-bold mb-2 text-lg">Specialized Expertise</h3>
              <p className="text-blue-100 text-sm">
                Each agent is optimized for a specific task (reconciliation, compliance, 
                budgeting) with deep domain knowledge.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
              <CheckCircle2 className="w-8 h-8 mb-3" />
              <h3 className="font-bold mb-2 text-lg">Consistent & Scalable</h3>
              <p className="text-blue-100 text-sm">
                Same high-quality analysis every time, whether analyzing 10 sites or 
                100 sites. No human fatigue or inconsistency.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
          </div>

          <p className="text-gray-600 text-lg mb-8">
            Five specialized AI agents work sequentially, each handling a specific aspect 
            of payment reconciliation. Each agent uses advanced tools to process data 
            efficiently and passes findings to the next agent.
          </p>

          <div className="space-y-4">
            {/* Agent 1 */}
            <div className="flex items-start gap-4 bg-blue-50 border-2 border-blue-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="bg-blue-600 text-white p-3 rounded-lg flex-shrink-0">
                <Database className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-gray-900 text-lg">1. Data Ingestion Agent</h3>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                    DATA VALIDATION
                  </span>
                </div>
                <p className="text-gray-600 mb-3">
                  Loads payment data from multiple sources (site contracts, patient visits, 
                  payment records, budgets) and validates data quality.
                </p>
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Validates 2000+ records in seconds</span>
                </div>
              </div>
            </div>

            {/* Agent 2 */}
            <div className="flex items-start gap-4 bg-purple-50 border-2 border-purple-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="bg-purple-600 text-white p-3 rounded-lg flex-shrink-0">
                <GitCompare className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-gray-900 text-lg">2. Reconciliation Agent</h3>
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
                    MATCHING ENGINE
                  </span>
                </div>
                <p className="text-gray-600 mb-3">
                  Matches every patient visit to corresponding payments. Identifies unpaid 
                  visits, duplicate payments, and screen failure errors.
                </p>
                <div className="flex items-center gap-2 text-sm text-purple-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Finds discrepancies humans miss</span>
                </div>
              </div>
            </div>

            {/* Agent 3 */}
            <div className="flex items-start gap-4 bg-green-50 border-2 border-green-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="bg-green-600 text-white p-3 rounded-lg flex-shrink-0">
                <FileCheck className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-gray-900 text-lg">3. Contract Compliance Agent</h3>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                    RATE VALIDATION
                  </span>
                </div>
                <p className="text-gray-600 mb-3">
                  Validates every payment amount against contracted rates. Identifies 
                  overcharges, undercharges, and systematic billing errors.
                </p>
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>100% contract compliance checking</span>
                </div>
              </div>
            </div>

            {/* Agent 4 */}
            <div className="flex items-start gap-4 bg-orange-50 border-2 border-orange-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="bg-orange-600 text-white p-3 rounded-lg flex-shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-gray-900 text-lg">4. Budget Analysis Agent</h3>
                  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold">
                    FORECASTING
                  </span>
                </div>
                <p className="text-gray-600 mb-3">
                  Monitors budget utilization across all sites. Projects spending, 
                  identifies overruns, and recommends corrective actions.
                </p>
                <div className="flex items-center gap-2 text-sm text-orange-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Proactive budget risk detection</span>
                </div>
              </div>
            </div>

            {/* Agent 5 */}
            <div className="flex items-start gap-4 bg-red-50 border-2 border-red-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="bg-red-600 text-white p-3 rounded-lg flex-shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-gray-900 text-lg">5. Report Generation Agent</h3>
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                    EXECUTIVE SUMMARY
                  </span>
                </div>
                <p className="text-gray-600 mb-3">
                  Synthesizes all findings into a prioritized executive report with clear 
                  action items and financial impact analysis.
                </p>
                <div className="flex items-center gap-2 text-sm text-red-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Actionable insights for leadership</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-xl border-2 border-green-200 p-8 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-600 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">The Impact</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border-2 border-green-200">
              <div className="text-4xl font-bold text-green-600 mb-2">95%</div>
              <p className="text-gray-600 font-medium">Time Reduction</p>
              <p className="text-sm text-gray-500 mt-2">
                From 40 hours to 2 hours per reconciliation cycle
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-blue-200">
              <div className="text-4xl font-bold text-blue-600 mb-2">99.8%</div>
              <p className="text-gray-600 font-medium">Accuracy Rate</p>
              <p className="text-sm text-gray-500 mt-2">
                Catches discrepancies that manual reviews miss
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-purple-200">
              <div className="text-4xl font-bold text-purple-600 mb-2">$150K+</div>
              <p className="text-gray-600 font-medium">Annual Savings</p>
              <p className="text-sm text-gray-500 mt-2">
                Recovered overpayments and prevented errors
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">See It In Action</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Experience how agentic AI transforms clinical trial payment reconciliation. 
            Watch the agents analyze real data and generate actionable insights in minutes.
          </p>
          <button
            onClick={onStartDemo}
            className="inline-flex items-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-xl hover:shadow-2xl transform hover:scale-105 transition-transform"
          >
            Try the Live Demo
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}