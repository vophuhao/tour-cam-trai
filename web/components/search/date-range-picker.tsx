'use client';

import { Button } from '@/components/ui/button';
import { vi } from 'date-fns/locale';
import { useState } from 'react';
import { DateRange, RangeKeyDict } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

export type DateRangeType = {
  from?: Date;
  to?: Date;
};

interface DateRangePickerProps {
  date?: DateRangeType;
  onDateChange: (date?: DateRangeType) => void;
}

const today = new Date();

export function DateRangePicker({ date, onDateChange }: DateRangePickerProps) {
  const [state, setState] = useState([
    {
      startDate: date?.from || today,
      endDate: date?.to || today,
      key: 'selection',
    },
  ]);

  const handleSelect = (ranges: RangeKeyDict) => {
    const selection = ranges.selection;

    // Only update when both dates are selected
    if (
      selection.startDate &&
      selection.endDate &&
      selection.startDate !== selection.endDate
    ) {
      setState([
        {
          startDate: selection.startDate,
          endDate: selection.endDate,
          key: 'selection',
        },
      ]);

      onDateChange({
        from: selection.startDate,
        to: selection.endDate,
      });
    } else {
      // Keep the selection in progress
      setState([
        {
          startDate: selection.startDate || today,
          endDate: selection.endDate || today,
          key: 'selection',
        },
      ]);
    }
  };

  return (
    <div className="space-y-4">
      <style jsx global>{`
        .rdrCalendarWrapper {
          font-family: inherit;
          width: 660px;
          color: inherit;
        }
        .rdrMonth {
          width: 100%;
        }
        .rdrMonthAndYearWrapper {
          padding-top: 0;
          padding-bottom: 0;
          height: 0px;
        }
        .rdrMonthAndYearPickers {
          display: none;
        }
        .rdrMonthName {
          text-align: center;
          font-weight: 600;
          font-size: 18px;
          color: #000;
          padding: 0;
        }
        .rdrWeekDay {
          color: #666;
          font-size: 12px;
          font-weight: 500;
          line-height: 3em;
        }
        .rdrDay {
          height: 48px;
        }
        .rdrDayNumber {
          font-weight: 500;
          font-size: 14px;
        }
        .rdrDayNumber span {
          color: #000;
        }
        .rdrDayToday .rdrDayNumber span {
          font-weight: 800;
        }
        .rdrDayPassive {
          visibility: hidden;
          pointer-events: none;
        }
        .rdrDayDisabled {
          background-color: transparent;
        }
        .rdrDayDisabled .rdrDayNumber span {
          text-decoration: line-through;
        }
        .rdrMonths {
          gap: 24px;
        }
        .rdrDay:not(.rdrDayPassive) .rdrInRange ~ .rdrDayNumber span,
        .rdrDay:not(.rdrDayPassive) .rdrStartEdge ~ .rdrDayNumber span,
        .rdrDay:not(.rdrDayPassive) .rdrEndEdge ~ .rdrDayNumber span,
        .rdrDay:not(.rdrDayPassive) .rdrSelected ~ .rdrDayNumber span {
          color: #000;
        }
      `}</style>

      <DateRange
        ranges={state}
        onChange={handleSelect}
        months={2}
        direction="horizontal"
        showDateDisplay={false}
        moveRangeOnFirstSelection={false}
        minDate={today}
        locale={vi}
        rangeColors={['#d4d6d8']}
      />

      <div className="flex justify-end">
        <Button
          variant="ghost"
          onClick={() => {
            setState([
              {
                startDate: today,
                endDate: today,
                key: 'selection',
              },
            ]);
            onDateChange(undefined);
          }}
          className="cursor-pointer font-semibold text-gray-900 underline hover:bg-transparent hover:text-gray-700"
        >
          Xóa ngày đã chọn
        </Button>
      </div>
    </div>
  );
}
