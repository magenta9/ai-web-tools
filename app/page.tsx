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
  Wrench,
  Cloud
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
    title: 'AI翻译',
    description: 'AI-powered translation between Chinese, English, and Japanese',
    icon: Languages
  },
  {
    href: '/prompt',
    title: 'Prompt 管理',
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

export default function Home() {
  return (
    <Layout>
      <div className="space-y-12">
        {/* Hero / Intro */}
        <section className="text-center py-8 md:py-12 max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl mb-4">
            Developer Utilities
          </h1>
          <p className="text-lg text-text-secondary leading-relaxed">
            A collection of free, accurate, and easy-to-use tools for developers.
            Optimized for productivity with AI-powered features.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-6 border-b border-theme pb-4">
            <Wrench className="text-primary" size={24} />
            <h2 className="text-xl font-bold text-text-primary">Regular Tools</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {regularTools.map((tool) => (
              <ToolCard key={tool.href} {...tool} />
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-6 border-b border-theme pb-4">
            <Sparkles className="text-primary" size={24} />
            <h2 className="text-xl font-bold text-text-primary">AI Powered</h2>
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
