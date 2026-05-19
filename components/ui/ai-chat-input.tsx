'use client'

import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent as ReactClipboardEvent,
  type DragEvent as ReactDragEvent,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'motion/react'
import { toast } from 'sonner'

import { Icon } from '@/components/ui/icon'
import { useMediaRecorder, type RecorderError } from '@/hooks/use-media-recorder'
import { cn } from '@/lib/utils'

const FILE_ACCEPT =
  '.pdf,.docx,.md,.markdown,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/markdown,text/plain'
const URL_REGEX = /https?:\/\/[^\s<>"']+/i

/**
 * UX-audience-tuned placeholders. Override via the `placeholders` prop.
 */
const DEFAULT_PLACEHOLDERS = [
  'Tell me about your design challenge',
  'Paste a job post URL',
  'What does your team need?',
  'Describe your product and its users',
  'Drop a JD — Federico will read it',
] as const

interface AIChatInputProps {
  onSend: (value: string) => void
  /** Called when the user picks a file via the paperclip. Parent owns the upload. */
  onAttachFile?: (file: File) => void
  /** Called when the user pastes a string that contains an http(s) URL. */
  onPasteUrl?: (url: string) => void
  /** Disables the attach + paste handlers (e.g. during an in-flight upload). */
  attachDisabled?: boolean
  placeholders?: readonly string[]
  className?: string
}

export function AIChatInput({
  onSend,
  onAttachFile,
  onPasteUrl,
  attachDisabled = false,
  placeholders = DEFAULT_PLACEHOLDERS,
  className,
}: AIChatInputProps) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [showPlaceholder, setShowPlaceholder] = useState(true)
  const [isActive, setIsActive] = useState(false)
  const [thinkActive, setThinkActive] = useState(false)
  const [deepSearchActive, setDeepSearchActive] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const dragDepthRef = useRef(0)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const reduce = useReducedMotion()

  const handleTranscript = (text: string) => {
    setInputValue((prev) => (prev ? `${prev} ${text}`.trim() : text))
    setIsActive(true)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const handleRecorderError = (error: RecorderError) => {
    const message =
      error.code === 'permission-denied'
        ? 'Microphone access denied. Enable it in your browser settings.'
        : error.code === 'no-device'
          ? 'No microphone found.'
          : error.code === 'unsupported'
            ? 'Voice input is not supported in this browser.'
            : error.code === 'transcription-failed'
              ? 'Could not transcribe audio. Try again.'
              : 'Something went wrong with the recorder.'
    toast.error(message)
  }

  const recorder = useMediaRecorder({
    onTranscript: handleTranscript,
    onError: handleRecorderError,
  })

  const isRecording = recorder.state === 'recording'
  const isStopping = recorder.state === 'stopping'
  const isTranscribing = recorder.state === 'transcribing'
  const isRequesting = recorder.state === 'requesting'
  const isVoiceBusy = recorder.isActive

  const isExpanded = isActive || inputValue.length > 0 || isVoiceBusy
  const shouldCycle = !isActive && inputValue.length === 0 && !isVoiceBusy

  useEffect(() => {
    if (!shouldCycle) return

    const interval = window.setInterval(() => {
      setShowPlaceholder(false)
      window.setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % placeholders.length)
        setShowPlaceholder(true)
      }, 400)
    }, 3000)

    return () => window.clearInterval(interval)
  }, [shouldCycle, placeholders.length])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node) &&
        !inputValue &&
        !isVoiceBusy
      ) {
        setIsActive(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [inputValue, isVoiceBusy])

  const handleSubmit = () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    onSend(trimmed)
    setInputValue('')
    setIsActive(false)
    inputRef.current?.blur()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    }
  }

  const handlePaste = (event: ReactClipboardEvent<HTMLInputElement>) => {
    if (!onPasteUrl || attachDisabled) return
    const pasted = event.clipboardData.getData('text')
    if (!pasted) return
    const match = pasted.match(URL_REGEX)
    if (!match) return
    // Don't let the URL land in the input — the confirm row above is the only
    // place it lives until the user accepts or dismisses. Prevents the URL from
    // being accidentally submitted as a chat message if ingest fails.
    event.preventDefault()
    onPasteUrl(match[0])
  }

  const handleAttachClick = (event: ReactMouseEvent) => {
    event.stopPropagation()
    if (!onAttachFile || attachDisabled) return
    fileInputRef.current?.click()
  }

  // Drag-and-drop: enter/leave events fire on every child too, so we count depth
  // to avoid the overlay flickering when the cursor crosses an inner element.
  const dragsEnabled = Boolean(onAttachFile) && !attachDisabled

  const handleDragEnter = (event: ReactDragEvent<HTMLDivElement>) => {
    if (!dragsEnabled) return
    if (!Array.from(event.dataTransfer.types).includes('Files')) return
    event.preventDefault()
    dragDepthRef.current += 1
    setDragActive(true)
  }

  const handleDragOver = (event: ReactDragEvent<HTMLDivElement>) => {
    if (!dragsEnabled) return
    if (!Array.from(event.dataTransfer.types).includes('Files')) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }

  const handleDragLeave = (event: ReactDragEvent<HTMLDivElement>) => {
    if (!dragsEnabled) return
    event.preventDefault()
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1)
    if (dragDepthRef.current === 0) setDragActive(false)
  }

  const handleDrop = (event: ReactDragEvent<HTMLDivElement>) => {
    if (!dragsEnabled) return
    event.preventDefault()
    dragDepthRef.current = 0
    setDragActive(false)
    const file = event.dataTransfer.files?.[0]
    if (file && onAttachFile) onAttachFile(file)
  }

  const stopBubble = (event: ReactMouseEvent) => event.stopPropagation()

  const handleMicClick = (event: ReactMouseEvent) => {
    stopBubble(event)
    if (recorder.state === 'idle') {
      void recorder.start()
    } else if (isRecording) {
      recorder.stop()
    }
  }

  const handleCancelClick = (event: ReactMouseEvent) => {
    stopBubble(event)
    recorder.cancel()
  }

  const containerVariants: Variants = {
    collapsed: {
      height: 68,
      boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)',
      transition: reduce ? { duration: 0 } : { type: 'spring', stiffness: 120, damping: 18 },
    },
    expanded: {
      height: 128,
      boxShadow: '0 8px 32px 0 rgba(0,0,0,0.16)',
      transition: reduce ? { duration: 0 } : { type: 'spring', stiffness: 120, damping: 18 },
    },
  }

  const placeholderContainerVariants: Variants = {
    initial: {},
    animate: { transition: { staggerChildren: reduce ? 0 : 0.025 } },
    exit: {
      transition: {
        staggerChildren: reduce ? 0 : 0.015,
        staggerDirection: -1,
      },
    },
  }

  const letterVariants: Variants = {
    initial: {
      opacity: 0,
      filter: reduce ? 'blur(0px)' : 'blur(12px)',
      y: reduce ? 0 : 10,
    },
    animate: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: reduce
        ? { duration: 0 }
        : {
            opacity: { duration: 0.25 },
            filter: { duration: 0.4 },
            y: { type: 'spring', stiffness: 80, damping: 20 },
          },
    },
    exit: {
      opacity: 0,
      filter: reduce ? 'blur(0px)' : 'blur(12px)',
      y: reduce ? 0 : -10,
      transition: reduce
        ? { duration: 0 }
        : {
            opacity: { duration: 0.2 },
            filter: { duration: 0.3 },
            y: { type: 'spring', stiffness: 80, damping: 20 },
          },
    },
  }

  const controlsVariants: Variants = {
    hidden: {
      opacity: 0,
      y: reduce ? 0 : 20,
      pointerEvents: 'none',
      transition: { duration: reduce ? 0 : 0.25 },
    },
    visible: {
      opacity: 1,
      y: 0,
      pointerEvents: 'auto',
      transition: { duration: reduce ? 0 : 0.35, delay: reduce ? 0 : 0.08 },
    },
  }

  const activeChipClasses = 'bg-foreground text-background'
  const inactiveChipClasses = 'bg-accent text-foreground hover:bg-border'

  const micLabel = isRecording
    ? 'Stop recording'
    : isTranscribing
      ? 'Transcribing'
      : isRequesting
        ? 'Requesting microphone'
        : 'Voice input'
  const showCancel = isRecording || isStopping
  const showVoiceIndicator = isRecording || isStopping || isTranscribing

  return (
    <motion.div
      ref={wrapperRef}
      role="group"
      aria-label="Chat input"
      className={cn(
        'bg-surface text-foreground w-full overflow-hidden rounded-4xl transition-shadow',
        dragActive && 'ring-foreground/30 ring-2 ring-offset-2',
        className,
      )}
      variants={containerVariants}
      animate={isExpanded ? 'expanded' : 'collapsed'}
      initial="collapsed"
      onClick={() => {
        setIsActive(true)
        inputRef.current?.focus()
      }}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex w-full flex-col">
        <div className="flex items-center gap-2 p-3">
          <button
            type="button"
            aria-label="Attach a job description (PDF, DOCX, MD, TXT)"
            disabled={!onAttachFile || attachDisabled}
            onClick={handleAttachClick}
            className="hover:bg-accent focus-visible:ring-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-40"
          >
            <Icon name="Paperclip" size={20} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={FILE_ACCEPT}
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ''
              if (file && onAttachFile) onAttachFile(file)
            }}
          />

          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onFocus={() => setIsActive(true)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              aria-label="Ask Federico anything"
              className="placeholder:text-muted-foreground w-full border-0 bg-transparent text-base font-medium outline-none placeholder:opacity-0"
              style={{ position: 'relative', zIndex: 1 }}
            />
            <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center">
              <AnimatePresence mode="wait">
                {showVoiceIndicator ? (
                  <motion.div
                    key="voice-indicator"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduce ? 0 : 0.2 }}
                    className="text-muted-foreground flex items-center gap-2 text-sm font-medium"
                  >
                    <VoiceWaveform active={isRecording} reduce={reduce ?? false} />
                    <span>
                      {isTranscribing
                        ? 'Transcribing…'
                        : isStopping
                          ? 'Wrapping up…'
                          : 'Listening…'}
                    </span>
                  </motion.div>
                ) : (
                  showPlaceholder &&
                  shouldCycle && (
                    <motion.span
                      key={placeholderIndex}
                      className="text-muted-foreground absolute top-1/2 left-0 flex -translate-y-1/2 text-base font-medium whitespace-nowrap select-none"
                      variants={placeholderContainerVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      {placeholders[placeholderIndex].split('').map((char, index) => (
                        <motion.span
                          key={`${placeholderIndex}-${index}`}
                          variants={letterVariants}
                          style={{ display: 'inline-block' }}
                        >
                          {char === ' ' ? ' ' : char}
                        </motion.span>
                      ))}
                    </motion.span>
                  )
                )}
              </AnimatePresence>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {showCancel && (
              <motion.button
                key="cancel-voice"
                type="button"
                aria-label="Cancel recording"
                onClick={handleCancelClick}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: reduce ? 0 : 0.15 }}
                className="hover:bg-accent focus-visible:ring-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                <Icon name="X" size={20} />
              </motion.button>
            )}
          </AnimatePresence>

          <button
            type="button"
            aria-label={micLabel}
            aria-pressed={isRecording}
            disabled={isStopping || isTranscribing || isRequesting}
            onClick={handleMicClick}
            className={cn(
              'focus-visible:ring-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60',
              isRecording
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/85'
                : 'hover:bg-accent',
            )}
          >
            {isRecording ? (
              <motion.span
                animate={reduce ? undefined : { scale: [1, 1.15, 1] }}
                transition={
                  reduce ? undefined : { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
                }
                className="flex items-center justify-center"
              >
                <Icon name="Square" size={16} />
              </motion.span>
            ) : isTranscribing || isStopping || isRequesting ? (
              <Icon name="Loader2" size={18} className="animate-spin" />
            ) : (
              <Icon name="Mic" size={20} />
            )}
          </button>

          <button
            type="button"
            aria-label="Send message"
            disabled={!inputValue.trim() || isVoiceBusy}
            onClick={(event) => {
              stopBubble(event)
              handleSubmit()
            }}
            className="bg-primary text-primary-foreground hover:bg-foreground/85 focus-visible:ring-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-40"
          >
            <Icon name="Send" size={18} />
          </button>
        </div>

        <motion.div
          className="flex items-center px-4 text-sm"
          variants={controlsVariants}
          initial="hidden"
          animate={isExpanded ? 'visible' : 'hidden'}
          aria-hidden={!isExpanded}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-pressed={thinkActive}
              tabIndex={isExpanded ? 0 : -1}
              onClick={(event) => {
                stopBubble(event)
                setThinkActive((prev) => !prev)
              }}
              className={cn(
                'focus-visible:ring-ring flex items-center gap-1 rounded-full px-4 py-2 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                thinkActive ? activeChipClasses : inactiveChipClasses,
              )}
            >
              <Icon name="Lightbulb" size={18} />
              Think
            </button>

            <motion.button
              type="button"
              aria-pressed={deepSearchActive}
              aria-label="Deep Search"
              tabIndex={isExpanded ? 0 : -1}
              onClick={(event) => {
                stopBubble(event)
                setDeepSearchActive((prev) => !prev)
              }}
              className={cn(
                'focus-visible:ring-ring flex items-center justify-start gap-1 overflow-hidden rounded-full py-2 font-medium whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                deepSearchActive ? activeChipClasses : inactiveChipClasses,
              )}
              initial={false}
              animate={{
                width: deepSearchActive ? 140 : 40,
                paddingLeft: deepSearchActive ? 12 : 11,
                paddingRight: deepSearchActive ? 16 : 11,
                transition: reduce ? { duration: 0 } : undefined,
              }}
            >
              <Icon name="Globe" size={18} className="shrink-0" />
              <motion.span
                initial={false}
                animate={{ opacity: deepSearchActive ? 1 : 0 }}
                transition={{ duration: reduce ? 0 : 0.2 }}
                className="shrink-0 pb-[2px]"
              >
                Deep Search
              </motion.span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

function VoiceWaveform({ active, reduce }: { active: boolean; reduce: boolean }) {
  const bars = [0, 1, 2, 3]
  return (
    <div aria-hidden className="flex h-4 items-center gap-[3px]">
      {bars.map((index) => (
        <motion.span
          key={index}
          className="bg-destructive block w-[3px] rounded-full"
          initial={{ height: 6 }}
          animate={
            active && !reduce ? { height: [6, 14, 8, 16, 6] } : { height: 6 }
          }
          transition={
            active && !reduce
              ? {
                  duration: 1,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: index * 0.12,
                }
              : { duration: 0 }
          }
        />
      ))}
    </div>
  )
}
