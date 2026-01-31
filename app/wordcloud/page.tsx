'use client'

import React, { useState } from 'react'
import Layout from '../components/Layout'
import { Panel } from '../components/Panel'
import WordCloudCanvas from './WordCloudCanvas'
import { Cloud, Eraser, AlignCenter } from 'lucide-react'
import '../tools.css'

export default function WordCloudPage() {
  const [text, setText] = useState('')

  return (
    <Layout>
      <div className="word-cloud-tool">
        <div className="json-container">
            {/* Panels */}
            <div className="panels">
                {/* Input Panel */}
                <Panel
                    title="INPUT TEXT"
                    icon={<Cloud size={14} />}
                    actions={
                        <button
                            className="panel-btn"
                            onClick={() => setText('')}
                            disabled={!text}
                        >
                            <Eraser size={14} /> CLEAR
                        </button>
                    }
                    footer={
                        <div className="stats">
                             <span>{text.length} chars</span>
                        </div>
                    }
                >
                    <textarea
                        className="code-textarea"
                        placeholder="Enter text here to generate a word cloud..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        style={{ fontFamily: 'var(--font-sans)', fontSize: '14px' }}
                    />
                </Panel>

                {/* Output Panel */}
                <Panel
                    title="WORD CLOUD"
                    icon={<AlignCenter size={14} />}
                    contentClassName="p-0 overflow-hidden"
                    footer={
                         <div className="stats">
                            <span>Top words by frequency</span>
                         </div>
                    }
                >
                    <WordCloudCanvas text={text} />
                </Panel>
            </div>
        </div>
      </div>
    </Layout>
  )
}
