'use client'

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'motion/react'

import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

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
  placeholders?: readonly string[]
  className?: string
}

export function AIChatInput({
  onSend,
  placeholders = DEFAULT_PLACEHOLDERS,
  className,
}: AIChatInputProps) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [showPlaceholder, setShowPlaceholder] = useState(true)
  const [isActive, setIsActive] = useState(false)
  const [thinkActive, setThinkActive] = useState(false)
  const [deepSearchActive, setDeepSearchActive] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const reduce = useReducedMotion()

  const isExpanded = isActive || inputValue.length > 0
  const shouldCycle = !isActive && inputValue.length === 0

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
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node) && !inputValue) {
        setIsActive(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [inputValue])

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

  const stopBubble = (event: ReactMouseEvent) => event.stopPropagation()

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

  return (
    <motion.div
      ref={wrapperRef}
      role="group"
      aria-label="Chat input"
      className={cn('bg-surface text-foreground w-full overflow-hidden rounded-4xl', className)}
      variants={containerVariants}
      animate={isExpanded ? 'expanded' : 'collapsed'}
      initial="collapsed"
      onClick={() => {
        setIsActive(true)
        inputRef.current?.focus()
      }}
    >
      <div className="flex w-full flex-col">
        <div className="flex items-center gap-2 p-3">
          <button
            type="button"
            aria-label="Attach file"
            className="hover:bg-accent focus-visible:ring-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            <Icon name="Paperclip" size={20} />
          </button>

          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onFocus={() => setIsActive(true)}
              onKeyDown={handleKeyDown}
              aria-label="Ask Federico anything"
              className="placeholder:text-muted-foreground w-full border-0 bg-transparent text-base font-medium outline-none placeholder:opacity-0"
              style={{ position: 'relative', zIndex: 1 }}
            />
            <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center">
              <AnimatePresence mode="wait">
                {showPlaceholder && shouldCycle && (
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
                        {char === ' ' ? ' ' : char}
                      </motion.span>
                    ))}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          <button
            type="button"
            aria-label="Voice input"
            className="hover:bg-accent focus-visible:ring-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            <Icon name="Mic" size={20} />
          </button>

          <button
            type="button"
            aria-label="Send message"
            disabled={!inputValue.trim()}
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
