"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4 select-none", className)}
      classNames={{
        months: "flex flex-col space-y-4",
        month: "space-y-3",
        month_caption: "flex justify-between items-center px-1",
        caption_label: "text-sm font-semibold text-slate-900",
        nav: "flex items-center gap-1",
        button_previous: cn(
          "inline-flex items-center justify-center h-7 w-7 rounded-md",
          "border border-slate-200 bg-white text-slate-600",
          "hover:bg-slate-50 hover:text-slate-900 transition-colors"
        ),
        button_next: cn(
          "inline-flex items-center justify-center h-7 w-7 rounded-md",
          "border border-slate-200 bg-white text-slate-600",
          "hover:bg-slate-50 hover:text-slate-900 transition-colors"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "text-blue-500 rounded-md w-9 font-semibold text-[0.75rem] text-center",
        weeks: "space-y-1",
        week: "flex w-full mt-1",
        day: "h-9 w-9 text-center text-sm p-0 relative flex items-center justify-center",
        day_button: cn(
          "h-9 w-9 p-0 font-normal text-sm text-slate-700 rounded-md",
          "flex items-center justify-center",
          "hover:bg-slate-100 hover:text-slate-900 transition-colors",
          "focus:outline-none"
        ),
        selected:
          "bg-blue-600 text-white hover:bg-blue-700 hover:text-white rounded-md",
        today: "bg-blue-100 text-blue-700 font-semibold ring-1 ring-blue-400 rounded-md",
        outside: "text-slate-300",
        disabled: "text-slate-300 pointer-events-none",
        range_middle: "bg-blue-50 text-blue-700",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...rest }) =>
          orientation === "left" ? (
            <ChevronLeft className="h-4 w-4" {...(rest as object)} />
          ) : (
            <ChevronRight className="h-4 w-4" {...(rest as object)} />
          ),
      }}
      {...props}
    />
  );
}
