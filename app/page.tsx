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
  Sparkles,
  Languages,
  MessageSquare,
  BookText,
  Search,
  LayoutGrid
} from 'lucide-react'

const regularTools = [
  {
    href: '/json',
    title: 'JSON Tool',
    description: 'Format, validate, minify, and analyze JSON data with advanced visualization.',
    icon: Code
  },
  {
    href: '/image',
    title: 'Image Converter',
    description: 'Convert between various image formats and process image keys/URLs instantly.',
    icon: Image
  },
  {
    href: '/diff',
    title: 'JSON Diff',
    description: 'Compare two JSON objects side-by-side and highlight structural differences.',
    icon: GitCompare
  },
  {
    href: '/timestamp',
    title: 'Timestamp Converter',
    description: 'Convert between Unix timestamps and human-readable dates with timezone support.',
    icon: Clock
  },
  {
    href: '/jwt',
    title: 'JWT Debugger',
    description: 'Decode, verify, and generate JSON Web Tokens for authentication testing.',
    icon: Key
  }
]

const aiTools = [
  {
    href: '/jsonfix',
    title: 'AI JSON Fixer',
    description: 'Intelligently repair malformed JSON data and recover structure using AI.',
    icon: FileJson
  },
  {
    href: '/aisql',
    title: 'AI SQL Generator',
    description: 'Convert natural language descriptions into complex SQL queries automatically.',
    icon: Database
  },
  {
    href: '/translate',
    title: 'Smart Translate',
    description: 'Context-aware translation between Chinese, English, and Japanese.',
    icon: Languages
  },
  {
    href: '/prompt',
    title: 'Prompt Manager',
    description: 'Organize, version, and refine your AI system prompts and templates.',
    icon: BookText
  },
  {
    href: '/chat',
    title: 'AI Playground',
    description: 'Interactive chat environment for testing and iterating on your prompts.',
    icon: MessageSquare
  }
]

export default function Home() {
  return (
    <Layout>
      <div className="space-y-10 max-w-6xl mx-auto pb-10">
        {/* Hero Section */}
        <section className="text-center py-10 md:py-16">
          <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-surface-hover text-xs font-medium text-text-secondary mb-6 border border-theme">
            v2.0 Now Available
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl md:text-6xl mb-6">
            Developer Utilities
            <span className="block text-text-secondary opacity-40 mt-2 text-3xl sm:text-4xl md:text-5xl">for Modern Engineering</span>
          </h1>
          <p className="text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto mb-10">
            A suite of free, privacy-focused tools designed to streamline your development workflow.
            From JSON formatting to AI-powered query generation.
          </p>

          <div className="max-w-md mx-auto relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-text-muted group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-theme rounded-xl leading-5 bg-surface placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm shadow-sm transition-all"
              placeholder="Search tools (e.g., 'json', 'sql')..."
            />
          </div>
        </section>

        {/* Regular Tools Section */}
        <section>
          <div className="flex items-center justify-between mb-6 px-1">
            <div className="flex items-center gap-2">
              <LayoutGrid className="text-text-primary" size={20} />
              <h2 className="text-xl font-bold text-text-primary tracking-tight">Core Utilities</h2>
            </div>
            <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
              {regularTools.length} Tools
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {regularTools.map((tool) => (
              <ToolCard key={tool.href} {...tool} />
            ))}
          </div>
        </section>

        {/* AI Tools Section */}
        <section>
          <div className="flex items-center justify-between mb-6 px-1 pt-8 border-t border-theme">
            <div className="flex items-center gap-2">
              <Sparkles className="text-text-primary" size={20} />
              <h2 className="text-xl font-bold text-text-primary tracking-tight">AI Powered</h2>
            </div>
             <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
              {aiTools.length} Tools
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {aiTools.map((tool) => (
              <ToolCard key={tool.href} {...tool} />
            ))}
          </div>
        </section>
      </div>
    </Layout>
  )
}
