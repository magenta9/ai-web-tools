'use client'

import Layout from './components/Layout'
import ToolCard from './components/ToolCard'
import {
  Code,
  Image,
  GitCompare,
  Clock,
  Key,
  Database,
  FileJson,
  Languages,
  MessageSquare,
  BookText,
  Cloud,
  TrendingUp,
  TrendingDown,
  LayoutDashboard,
  Users,
  Zap
} from 'lucide-react'

const regularTools = [
  {
    href: '/wordcloud',
    title: 'Word Cloud',
    description: 'Generate interactive word clouds from text',
    icon: Cloud
  },
  {
    href: '/json',
    title: 'JSON Tool',
    description: 'Format, validate, minify, and analyze JSON data',
    icon: Code
  },
  {
    href: '/image',
    title: 'Image Converter',
    description: 'Convert image keys/URLs and vice versa',
    icon: Image
  },
  {
    href: '/diff',
    title: 'JSON Diff',
    description: 'Compare two JSON objects and find differences',
    icon: GitCompare
  },
  {
    href: '/timestamp',
    title: 'Timestamp Converter',
    description: 'Convert between timestamps and human-readable dates',
    icon: Clock
  },
  {
    href: '/jwt',
    title: 'JWT Tool',
    description: 'Encode and decode JWT tokens',
    icon: Key
  }
]

const aiTools = [
  {
    href: '/jsonfix',
    title: 'AI JSON Fix',
    description: 'Fix non-standard JSON data with AI',
    icon: FileJson
  },
  {
    href: '/aisql',
    title: 'AI SQL',
    description: 'Natural language to SQL with AI',
    icon: Database
  },
  {
    href: '/translate',
    title: 'AI Translate',
    description: 'AI-powered translation between Chinese, English, and Japanese',
    icon: Languages
  },
  {
    href: '/prompt',
    title: 'Prompt Manager',
    description: 'Manage and organize your AI prompt templates',
    icon: BookText
  },
  {
    href: '/chat',
    title: 'AI Chat',
    description: 'Chat with AI using your prompt templates',
    icon: MessageSquare
  }
]

type StatColor = 'indigo' | 'emerald' | 'blue' | 'amber';

const colorStyles: Record<StatColor, string> = {
  indigo: 'bg-indigo-50 text-indigo-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  blue: 'bg-blue-50 text-blue-600',
  amber: 'bg-amber-50 text-amber-600',
}

interface StatCardProps {
  title: string;
  value: string | number;
  trend: string;
  trendUp: boolean;
  icon: React.ElementType;
  color: StatColor;
}

const StatCard = ({ title, value, trend, trendUp, icon: Icon, color }: StatCardProps) => (
  <div className="bg-surface p-6 rounded-xl border border-theme shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-text-muted">{title}</p>
        <h3 className="text-2xl font-bold text-text-primary mt-2">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${colorStyles[color] || 'bg-gray-100 text-gray-600'}`}>
        <Icon size={24} />
      </div>
    </div>
    <div className="mt-4 flex items-center text-sm">
      <span className={`
        flex items-center font-medium
        ${trendUp ? 'text-emerald-600' : 'text-red-600'}
      `}>
        {trendUp ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
        {trend}
      </span>
      <span className="text-text-muted ml-2">vs last month</span>
    </div>
  </div>
);

export default function Home() {
  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary text-sm mt-1">Welcome back, here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-surface border border-theme text-text-secondary text-sm font-medium rounded-lg hover:bg-surface-hover transition-colors shadow-sm">
            Download Report
          </button>
          <button className="px-4 py-2 bg-primary text-primary-text text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors shadow-sm shadow-indigo-200">
            + New Tool
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Tools"
          value={regularTools.length + aiTools.length}
          trend="+2"
          trendUp={true}
          icon={LayoutDashboard}
          color="indigo"
        />
        <StatCard
          title="Regular Tools"
          value={regularTools.length}
          trend="+1"
          trendUp={true}
          icon={Zap}
          color="amber"
        />
        <StatCard
          title="AI Tools"
          value={aiTools.length}
          trend="+1"
          trendUp={true}
          icon={Database} // Using Database as proxy for AI/backend heavy
          color="emerald"
        />
        <StatCard
          title="Active Users"
          value="1.2k"
          trend="+12%"
          trendUp={true}
          icon={Users}
          color="blue"
        />
      </div>

      <div className="space-y-8">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-text-primary">Regular Tools</h2>
            <button className="text-primary text-sm font-medium hover:underline">View All</button>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {regularTools.map((tool) => (
              <ToolCard key={tool.href} {...tool} />
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-text-primary">AI Powered</h2>
            <button className="text-primary text-sm font-medium hover:underline">View All</button>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {aiTools.map((tool) => (
              <ToolCard key={tool.href} {...tool} />
            ))}
          </div>
        </section>
      </div>
    </Layout>
  )
}
