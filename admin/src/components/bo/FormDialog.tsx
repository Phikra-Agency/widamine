import type { FormEvent, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface FormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: ReactNode
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void
  submitLabel?: string
  cancelLabel?: string
  onCancel?: () => void
  footer?: ReactNode
  className?: string
  contentClassName?: string
}

export default function FormDialog({
  open,
  onOpenChange,
  title,
  children,
  onSubmit,
  submitLabel = 'Enregistrer',
  cancelLabel = 'Annuler',
  onCancel,
  footer,
  className,
  contentClassName,
}: FormDialogProps) {
  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  const body = (
    <>
      <DialogHeader className='border-b border-border px-5 py-4 text-left'>
        <DialogTitle className='text-base font-semibold text-secondary sm:text-lg'>{title}</DialogTitle>
      </DialogHeader>
      <ScrollArea className={cn('max-h-[calc(100vh-12rem)]', contentClassName)}>
        <div className='space-y-5 p-5 sm:p-6'>{children}</div>
      </ScrollArea>
      {footer ?? (
        <DialogFooter className='border-t border-border px-5 py-4 sm:px-6'>
          <Button type='button' variant='ghost' onClick={handleCancel}>
            {cancelLabel}
          </Button>
          {onSubmit && (
            <Button type='submit'>{submitLabel}</Button>
          )}
        </DialogFooter>
      )}
    </>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className={cn('gap-0 overflow-hidden p-0 sm:max-w-md', className)}>
        {onSubmit ? (
          <form onSubmit={onSubmit} noValidate>{body}</form>
        ) : (
          body
        )}
      </DialogContent>
    </Dialog>
  )
}
