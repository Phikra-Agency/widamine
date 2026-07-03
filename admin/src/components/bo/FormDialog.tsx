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
      <ScrollArea className={cn('min-h-0 flex-1 overflow-y-auto max-h-[calc(100vh-12rem)]', contentClassName)}>
        <div className='space-y-5 p-5 sm:p-6'>{children}</div>
      </ScrollArea>
      {footer ?? (
        <DialogFooter className='flex-row items-center justify-between gap-2 border-t border-border px-[30px] pt-5 pb-7 sm:px-6 sm:py-6'>
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
      <DialogContent showCloseButton className={cn('flex flex-col gap-0 p-0 max-lg:left-[15px] max-lg:right-[15px] max-lg:top-1/2 max-lg:-translate-y-1/2 sm:max-w-md', className)}>
        {onSubmit ? (
          <form onSubmit={onSubmit} noValidate className='flex flex-col flex-1 min-h-0'>{body}</form>
        ) : (
          <div className='flex flex-col flex-1 min-h-0'>{body}</div>
        )}
      </DialogContent>
    </Dialog>
  )
}
