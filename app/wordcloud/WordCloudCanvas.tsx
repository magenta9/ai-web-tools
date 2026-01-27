'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import cloud from 'd3-cloud'
import { STOP_WORDS } from '@/constants/stopwords'
import { useClipboard } from '../hooks'

interface WordCloudCanvasProps {
  text: string
}

interface Word {
  text: string
  size: number
  count: number // Keep track of original count
  x?: number
  y?: number
  rotate?: number
  font?: string
  style?: string
  weight?: string | number
}

export default function WordCloudCanvas({ text }: WordCloudCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { copyWithToast } = useClipboard()
  const [words, setWords] = useState<Word[]>([])
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [isGenerating, setIsGenerating] = useState(false)

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return

    const updateDimensions = () => {
        if (containerRef.current) {
            const width = containerRef.current.clientWidth
            const height = containerRef.current.clientHeight
            setDimensions({ width, height })
        }
    }

    updateDimensions()

    const observer = new ResizeObserver(updateDimensions)
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // Process text and generate words
  useEffect(() => {
    if (!text.trim() || dimensions.width === 0 || dimensions.height === 0) {
      setWords([])
      return
    }

    setIsGenerating(true)
    let isMounted = true

    const processText = () => {
      // Use Intl.Segmenter for language-aware segmentation
      const segmenter = new Intl.Segmenter('zh-CN', { granularity: 'word' })
      const counts = new Map<string, number>()

      // Limit text length to prevent freezing on massive inputs
      const maxTextLength = 100000;
      const textToProcess = text.length > maxTextLength ? text.substring(0, maxTextLength) : text;

      // Use Array.from to handle iteration safely with current tsconfig target
      for (const { segment, isWordLike } of Array.from(segmenter.segment(textToProcess))) {
        if (isWordLike) {
          const word = segment.trim().toLowerCase()

          if (word.length > 0 && !STOP_WORDS.has(word)) {
             counts.set(word, (counts.get(word) || 0) + 1)
          }
        }
      }

      const wordList = Array.from(counts.entries())
        .map(([text, value]) => ({ text, size: value, count: value }))
        .sort((a, b) => b.size - a.size)
        .slice(0, 150) // Limit to top 150 words for performance and clarity

      if (wordList.length === 0) {
        if (isMounted) {
            setWords([])
            setIsGenerating(false)
        }
        return
      }

      // Normalize size
      const maxSize = wordList[0].size
      const minSize = wordList[wordList.length - 1].size

      // Log scale for better distribution
      const fontScale = d3.scaleLog()
        .domain([minSize, maxSize])
        .range([14, 80])

      const layout = cloud()
        .size([dimensions.width, dimensions.height])
        .words(wordList.map(d => ({ ...d, size: fontScale(d.size) })))
        .padding(5)
        .rotate(() => (~~(Math.random() * 2) * 90)) // 0 or 90 degrees
        .font("Impact, sans-serif")
        .fontSize(d => d.size as number)
        .on("end", (computedWords: Word[]) => {
            if (isMounted) {
                setWords(computedWords)
                setIsGenerating(false)
            }
        })

      layout.start()
    }

    // Debounce slightly to avoid rapid updates
    const timer = setTimeout(processText, 300)

    return () => {
        clearTimeout(timer)
        isMounted = false
    }

  }, [text, dimensions])

  // Render SVG
  useEffect(() => {
    if (!svgRef.current || words.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const g = svg.append("g")
      // Start centered
      .attr("transform", `translate(${dimensions.width / 2},${dimensions.height / 2})`)

    // Color scale - use a pleasing palette
    // d3.schemeTableau10 is good, or customized.
    const color = d3.scaleOrdinal(d3.schemeTableau10);

    const textElements = g.selectAll("text")
      .data(words)
      .enter().append("text")
      .style("font-size", d => `${d.size}px`)
      .style("font-family", "Impact, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif")
      .style("fill", (d, i) => color(i.toString()))
      .attr("text-anchor", "middle")
      .attr("transform", d => `translate(${d.x},${d.y})rotate(${d.rotate})`)
      .text(d => d.text)
      .style("cursor", "pointer")
      .style("user-select", "none")
      .style("transition", "opacity 0.2s")
      .on("click", (event, d) => {
        event.stopPropagation()
        copyWithToast(d.text)
      })
      .on("mouseover", function() {
        d3.select(this).style("opacity", 0.7)
      })
      .on("mouseout", function() {
        d3.select(this).style("opacity", 1)
      })

    // Tooltip via title
    textElements.append("title")
        .text(d => `${d.text}: ${d.count}`)

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 5])
      .on("zoom", (event) => {
        g.attr("transform", event.transform)
      })

    svg.call(zoom)

    // Initial transform to center
    svg.call(zoom.transform, d3.zoomIdentity.translate(dimensions.width / 2, dimensions.height / 2))

  }, [words, dimensions, copyWithToast])

  return (
    <div ref={containerRef} className="w-full h-full min-h-[500px] border border-theme rounded-lg overflow-hidden bg-background relative shadow-sm">
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="w-full h-full block cursor-move" />

      {isGenerating && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
           <div className="text-primary font-medium">Generating Word Cloud...</div>
        </div>
      )}

      {!isGenerating && words.length === 0 && text.trim() && (
         <div className="absolute inset-0 flex items-center justify-center text-text-secondary">
           No valid words found to display.
        </div>
      )}

      {words.length === 0 && !text.trim() && (
        <div className="absolute inset-0 flex items-center justify-center text-text-secondary">
           Enter text to generate a word cloud
        </div>
      )}

      {words.length > 0 && (
          <div className="absolute bottom-2 right-2 text-xs text-text-muted bg-background/80 p-1 rounded">
              Scroll to zoom • Drag to pan • Click to copy
          </div>
      )}
    </div>
  )
}
