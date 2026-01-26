'use client'

import React, { useState } from 'react'
import Layout from '../components/Layout'
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
                <div className="panel">
                    <div className="panel-header">
                        <div className="panel-title">
                            <Cloud size={14} /> INPUT TEXT
                        </div>
                        <div className="panel-actions">
                            <button
                                className="panel-btn"
                                onClick={() => setText('')}
                                disabled={!text}
                            >
                                <Eraser size={14} /> CLEAR
                            </button>
                        </div>
                    </div>
                    <div className="panel-content">
                        <textarea
                            className="code-textarea"
                            placeholder="Enter text here to generate a word cloud..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            style={{ fontFamily: 'var(--font-sans)', fontSize: '14px' }}
                        />
                    </div>
                    <div className="panel-footer">
                        <div className="stats">
                             <span>{text.length} chars</span>
                        </div>
                    </div>
                </div>

                {/* Output Panel */}
                <div className="panel">
                    <div className="panel-header">
                         <div className="panel-title">
                            <AlignCenter size={14} /> WORD CLOUD
                        </div>
                    </div>
                    <div className="panel-content" style={{ padding: 0, overflow: 'hidden' }}>
                        <WordCloudCanvas text={text} />
                    </div>
                     <div className="panel-footer">
                         <div className="stats">
                            <span>Top words by frequency</span>
                         </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </Layout>
  )
}
