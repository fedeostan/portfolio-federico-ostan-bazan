'use client'

import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Icon } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function Smoke() {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Issue #7 smoke
      </h2>

      <Card>
        <CardHeader>
          <CardTitle>Card primitive</CardTitle>
          <CardDescription>
            shadcn Card on the design.md surface token.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="smoke-name">Your name</Label>
            <Input id="smoke-name" placeholder="Federico…" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="smoke-msg">Message</Label>
            <Textarea id="smoke-msg" placeholder="Say hi" rows={3} />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-4 rounded-[var(--radius-lg)] border border-border bg-card p-4">
        <span className="text-xs font-medium text-muted-foreground">
          Icons (default 20px / 1.75 stroke):
        </span>
        <Icon name="Send" />
        <Icon name="Mic" />
        <Icon name="Paperclip" />
      </div>

      <Carousel className="w-full">
        <CarouselContent>
          {['One', 'Two', 'Three'].map((label) => (
            <CarouselItem key={label} className="basis-1/2">
              <div className="flex h-32 items-center justify-center rounded-[var(--radius-lg)] border border-border bg-card text-base font-medium">
                {label}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      <div>
        <Button
          variant="outline"
          onClick={() =>
            toast.success('Toast wired', {
              description: 'sonner via @/components/ui/sonner',
            })
          }
        >
          <Icon name="Send" className="mr-2" />
          Fire toast
        </Button>
      </div>
    </section>
  )
}
