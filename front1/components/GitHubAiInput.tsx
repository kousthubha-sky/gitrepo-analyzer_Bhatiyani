"use client"

/**
 * @fileoverview GitHub Repository Input Component
 * 
 * This component provides an animated input interface for entering GitHub repository URLs.
 * It features auto-resizing textarea, loading states, and animated transitions.
 * 
 * @author Kousthubha
 * @version 1.0.0
 */

import { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Globe, Send, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { ThemeToggle } from "./theme-toggle"

/**
 * Props for the auto-resizing textarea hook
 * @interface UseAutoResizeTextareaProps
 * @property {number} minHeight - Minimum height of the textarea in pixels
 * @property {number} [maxHeight] - Optional maximum height of the textarea in pixels
 */
interface UseAutoResizeTextareaProps {
  minHeight: number
  maxHeight?: number
}

/**
 * Custom hook to handle textarea auto-resizing
 * @param {UseAutoResizeTextareaProps} props - Configuration for the auto-resize behavior
 * @returns {{ textareaRef: React.RefObject<HTMLTextAreaElement>, adjustHeight: (reset?: boolean) => void }}
 */
function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) {
  // Reference to the textarea DOM element
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  /**
   * Adjusts the height of the textarea based on its content
   * @param {boolean} [reset] - If true, resets height to minHeight
   */
  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current
      if (!textarea) return

      if (reset) {
        textarea.style.height = `${minHeight}px`
        return
      }

      textarea.style.height = `${minHeight}px`
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY)
      )

      textarea.style.height = `${newHeight}px`
    },
    [minHeight, maxHeight]
  )

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = `${minHeight}px`
    }
  }, [minHeight])

  useEffect(() => {
    const handleResize = () => adjustHeight()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [adjustHeight])

  return { textareaRef, adjustHeight }
}

const MIN_HEIGHT = 48
const MAX_HEIGHT = 164

const AnimatedPlaceholder = ({ showSearch }: { showSearch: boolean }) => (
  <AnimatePresence mode="wait">
    <motion.p
      key={showSearch ? "search" : "ask"}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.2 }}
      className="pointer-events-none text-sm absolute text-muted-foreground/70"
    >
      {showSearch ? "Search repo" : "Enter GitHub Repository URL..."}
    </motion.p>
  </AnimatePresence>
)

/**
 * Props for the GitHubAiInput component
 * @interface GitHubAiInputProps
 * @property {(repoUrl: string) => void} onAnalyze - Callback function triggered when a repository URL is submitted
 * @property {boolean} isAnalyzing - Flag indicating if analysis is in progress
 * @property {boolean} hasAnalyzed - Flag indicating if analysis has been completed
 * @property {string} [className] - Optional CSS classes to apply to the component
 */
interface GitHubAiInputProps {
  onAnalyze: (repoUrl: string) => void
  isAnalyzing: boolean
  hasAnalyzed: boolean
  className?: string
}

/**
 * GitHubAiInput Component
 * 
 * A sophisticated input component for analyzing GitHub repositories. Features include:
 * - Auto-resizing textarea
 * - Animated placeholder text
 * - Loading states with animations
 * - Theme toggle integration
 * - Search mode toggle
 * 
 * @param {GitHubAiInputProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export function GitHubAiInput({ 
  onAnalyze, 
  isAnalyzing, 
  hasAnalyzed, 
  className 
}: GitHubAiInputProps) {
    // State for input value and search mode
  const [value, setValue] = useState("")
  const [showSearch, setShowSearch] = useState(true)

  // Initialize auto-resize textarea
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: MIN_HEIGHT,
    maxHeight: MAX_HEIGHT,
  })

  /**
   * Handles the submission of repository URL for analysis
   * Validates input, triggers analysis, and resets the input field
   */
  const handleSubmit = () => {
    if (!value.trim() || isAnalyzing) return
    
    onAnalyze(value.trim())
    setValue("")
    adjustHeight(true)
  }

  /**
   * Handles keyboard events for the textarea
   * Submits on Enter (without shift) and prevents default newline
   * @param {React.KeyboardEvent} e - Keyboard event object
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  // Animated container styles based on analysis state
  const containerAnimation = {
    y: hasAnalyzed ? -20 : 0,
    scale: hasAnalyzed ? 0.95 : 1,
  }

  return (
    <motion.div 
      className={cn("w-full py-4", className)}
      animate={containerAnimation}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
    >
      {isAnalyzing && (
        <div className="text-center mb-2 text-sm text-muted-foreground">
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            Please wait while we analyze the repository. This might take a few moments...
            <br />If search bar gets empty,try again.
          </motion.p>
        </div>
      )}
      <div className="relative max-w-2xl border rounded-[22px] border-border/20 p-1 w-full mx-auto backdrop-blur-sm bg-card/60">
        <div className="relative rounded-2xl border border-border/10 bg-background/40 backdrop-blur-sm flex flex-col">
          <div className="relative">
            <Textarea
              id="github-analyzer-input"
              value={value}
              placeholder=""
              className="w-full rounded-2xl rounded-b-none px-4 py-3 bg-background/20 border-none resize-none focus-visible:ring-0 leading-[1.2] text-foreground placeholder:text-muted-foreground overflow-hidden"
              ref={textareaRef}
              onKeyDown={handleKeyDown}
              onChange={(e) => {
                setValue(e.target.value)
                adjustHeight()
              }}
              disabled={isAnalyzing}
            />
            {!value && (
              <div className="absolute left-4 top-3">
                <AnimatedPlaceholder showSearch={showSearch} />
              </div>
            )}
          </div>

          <div className="h-15 bg-background/20 rounded-b-xl">
            <div className="absolute left-3 bottom-3 flex items-center gap-2">
              {/* Theme Toggle instead of file icon */}
              <div className="rounded-full p-1 bg-background/20 hover:bg-background/40 transition-colors">
                <ThemeToggle />
              </div>
              
              <button
                type="button"
                onClick={() => {
                  setShowSearch(!showSearch)
                }}
                className={cn(
                  "rounded-full transition-all flex items-center gap-2 px-1.5 py-1 border h-8",
                  showSearch
                    ? "bg-primary/15 border-primary text-primary"
                    : "bg-background/20 border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <motion.div
                    animate={{
                      rotate: showSearch ? 180 : 0,
                      scale: showSearch ? 1.1 : 1,
                    }}
                    whileHover={{
                      rotate: showSearch ? 180 : 15,
                      scale: 1.1,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 10,
                      },
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 25,
                    }}
                  >
                    <Globe
                      className={cn(
                        "w-4 h-4",
                        showSearch ? "text-primary" : "text-inherit"
                      )}
                    />
                  </motion.div>
                </div>
                <AnimatePresence>
                  {showSearch && (
                    <motion.span
                      initial={{ width: 0, opacity: 0 }}
                      animate={{
                        width: "auto",
                        opacity: 1,
                      }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm overflow-hidden whitespace-nowrap text-primary flex-shrink-0"
                    >
                      Search
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
            <div className="absolute right-3 bottom-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!value.trim() || isAnalyzing}
                className={cn(
                  "rounded-full p-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
                  value.trim() && !isAnalyzing
                    ? "bg-primary/15 text-primary hover:bg-primary/25 hover:scale-105"
                    : "bg-background/20 text-muted-foreground hover:text-foreground"
                )}
              >
                {isAnalyzing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Search className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
