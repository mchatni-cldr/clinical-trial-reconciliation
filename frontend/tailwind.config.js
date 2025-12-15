/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    // Safelist dynamic color classes used in AgentStatusCard
    'bg-blue-50', 'border-blue-300', 'text-blue-600', 'border-blue-200', 'bg-blue-100', 'text-blue-700', 'ring-blue-100', 'from-blue-50',
    'bg-purple-50', 'border-purple-300', 'text-purple-600', 'border-purple-200', 'bg-purple-100', 'text-purple-700', 'ring-purple-100', 'from-purple-50',
    'bg-green-50', 'border-green-300', 'text-green-600', 'border-green-200', 'bg-green-100', 'text-green-700', 'ring-green-100', 'from-green-50',
    'bg-orange-50', 'border-orange-300', 'text-orange-600', 'border-orange-200', 'bg-orange-100', 'text-orange-700', 'ring-orange-100', 'from-orange-50',
    'bg-red-50', 'border-red-300', 'text-red-600', 'border-red-200', 'bg-red-100', 'text-red-700', 'ring-red-100', 'from-red-50',
    'text-blue-500', 'text-purple-500', 'text-green-500', 'text-orange-500', 'text-red-500',
    'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500',
  ]
}