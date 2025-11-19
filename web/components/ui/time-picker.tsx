'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';
import { useState } from 'react';

interface TimePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function TimePicker({
  value = '',
  onChange,
  placeholder = 'Chọn giờ',
  className,
}: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const [hours, setHours] = useState(value ? value.split(':')[0] : '00');
  const [minutes, setMinutes] = useState(value ? value.split(':')[1] : '00');

  const handleApply = () => {
    const timeString = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    onChange(timeString);
    setOpen(false);
  };

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val === '' || (parseInt(val) >= 0 && parseInt(val) <= 23)) {
      setHours(val);
    }
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val === '' || (parseInt(val) >= 0 && parseInt(val) <= 59)) {
      setMinutes(val);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            className,
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {value || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="flex flex-col gap-4">
          <div className="text-sm font-medium">Chọn thời gian</div>
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-2">
              <label className="text-muted-foreground text-xs">Giờ</label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="00"
                value={hours}
                onChange={handleHoursChange}
                onBlur={() => setHours(hours.padStart(2, '0'))}
                className="w-16 text-center"
                maxLength={2}
              />
            </div>
            <span className="mt-6 text-xl">:</span>
            <div className="flex flex-col gap-2">
              <label className="text-muted-foreground text-xs">Phút</label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="00"
                value={minutes}
                onChange={handleMinutesChange}
                onBlur={() => setMinutes(minutes.padStart(2, '0'))}
                className="w-16 text-center"
                maxLength={2}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Hủy
            </Button>
            <Button size="sm" className="flex-1" onClick={handleApply}>
              Xác nhận
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
