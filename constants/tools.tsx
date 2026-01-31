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
  LucideIcon
} from 'lucide-react'

export interface Tool {
  href: string
  title: string
  description: string
  icon: LucideIcon
}

export const regularTools: Tool[] = [
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

export const aiTools: Tool[] = [
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

export const allTools = [...regularTools, ...aiTools]
