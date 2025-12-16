import Layout from './components/Layout'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCode,
  faImage,
  faCodeCompare,
  faClock,
  faKey
} from '@fortawesome/free-solid-svg-icons'

const tools = [
  {
    href: '/json',
    title: 'JSON Tool',
    description: 'Format, validate, minify, and analyze JSON data',
    icon: faCode
  },
  {
    href: '/image',
    title: 'Image Converter',
    description: 'Convert image keys/URLs and vice versa',
    icon: faImage
  },
  {
    href: '/diff',
    title: 'JSON Diff',
    description: 'Compare two JSON objects and find differences',
    icon: faCodeCompare
  },
  {
    href: '/timestamp',
    title: 'Timestamp Converter',
    description: 'Convert between timestamps and human-readable dates',
    icon: faClock
  },
  {
    href: '/jwt',
    title: 'JWT Tool',
    description: 'Encode and decode JWT tokens',
    icon: faKey
  }
]

export default function Home() {
  return (
    <Layout>
      <div className="container">
        <div className="hero">
          <h1>Welcome to Web Tools</h1>
          <p>A comprehensive suite of developer tools to make your life easier</p>
        </div>

        <div className="tools-grid">
          {tools.map((tool) => (
            <Link key={tool.href} href={tool.href} className="tool-card">
              <div className="tool-icon">
                <FontAwesomeIcon icon={tool.icon} />
              </div>
              <h3>{tool.title}</h3>
              <p>{tool.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  )
}