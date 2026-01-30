'use client'

import * as React from 'react'
import { DayPicker } from 'react-day-picker'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

export default function CalendarWidget({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={className}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium text-text-primary",
        nav: "space-x-1 flex items-center",
        nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-text-secondary hover:bg-surface-hover rounded-md flex items-center justify-center transition-all",
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-text-muted rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        // v9: 'day' is the cell, 'day_button' is the button
        day: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-surface-hover first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day_button: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-surface-hover rounded-md transition-colors text-text-primary cursor-pointer flex items-center justify-center bg-transparent border-none",

        // Modifiers
        selected:
          "bg-primary text-primary-text hover:bg-primary-hover hover:text-primary-text focus:bg-primary focus:text-primary-text",
        today: "bg-surface-hover text-text-primary font-bold border border-theme",
        outside:
          "text-text-muted opacity-50 aria-selected:bg-surface-hover/50 aria-selected:text-text-muted aria-selected:opacity-30",
        disabled: "text-text-muted opacity-50",
        hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  )
}
