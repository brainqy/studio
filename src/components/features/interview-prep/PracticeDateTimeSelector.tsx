
"use client";
import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isBefore, startOfToday, addDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIconLucide } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const timeSlots = ["08:30", "09:30", "10:30", "11:30", "12:30", "13:30", "14:30", "15:30", "16:30", "17:30", "18:30"];

interface PracticeDateTimeSelectorProps {
  onDateTimeSelected: (dateTime: Date) => void;
  onBack: () => void;
  practiceType: string;
}

export default function PracticeDateTimeSelector({ onDateTimeSelected, onBack, practiceType }: PracticeDateTimeSelectorProps) {
  const [currentDisplayMonth, setCurrentDisplayMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [showCalendarPopover, setShowCalendarPopover] = useState(false);

  const today = startOfToday();

  // Generate the next 7 days for quick selection
  const next7Days = Array.from({ length: 7 }, (_, i) => addDays(today, i));

  const handleDaySelect = (day: Date | undefined) => {
    if (!day || isBefore(day, today)) return; 
    setSelectedDate(day);
    setSelectedTime(undefined); 
    setShowCalendarPopover(false); 
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleBook = () => {
    if (selectedDate && selectedTime) {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const finalDateTime = new Date(selectedDate);
      finalDateTime.setHours(hours, minutes, 0, 0);
      onDateTimeSelected(finalDateTime);
    }
  };
  
  const getDayOfWeekShort = (date: Date) => format(date, 'E');


  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Choose Date and Time for {practiceType} Interview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-2 border rounded-md">
          <Button variant="ghost" size="icon" onClick={() => setCurrentDisplayMonth(subMonths(currentDisplayMonth, 1))}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="text-lg font-medium">{format(currentDisplayMonth, 'MMMM, yyyy')}</span>
          <Popover open={showCalendarPopover} onOpenChange={setShowCalendarPopover}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon">
                <CalendarIconLucide className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDaySelect}
                initialFocus
                month={currentDisplayMonth}
                onMonthChange={setCurrentDisplayMonth}
                disabled={(date) => isBefore(date, today)}
              />
            </PopoverContent>
          </Popover>
          <Button variant="ghost" size="icon" onClick={() => setCurrentDisplayMonth(addMonths(currentDisplayMonth, 1))}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Horizontal Day Scroller */}
        <div className="flex space-x-2 overflow-x-auto pb-2 -mb-2 py-2 bg-secondary/50 rounded-md p-2">
          {next7Days.map(day => (
            <Button
              key={day.toString()}
              variant={selectedDate && isSameDay(day, selectedDate) ? "default" : "outline"}
              className={cn(
                "flex flex-col items-center justify-center h-auto p-2.5 min-w-[60px] shadow-sm",
                "data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground",
                 isBefore(day, today) && "opacity-50 cursor-not-allowed",
                 selectedDate && isSameDay(day, selectedDate) && "ring-2 ring-primary ring-offset-2"
              )}
              onClick={() => !isBefore(day, today) && handleDaySelect(day)}
              disabled={isBefore(day, today)}
              data-selected={selectedDate && isSameDay(day, selectedDate)}
            >
              <span className="text-xs">{getDayOfWeekShort(day)}</span>
              <span className="text-lg font-semibold">{format(day, 'd')}</span>
            </Button>
          ))}
        </div>


        {selectedDate && (
          <div className="pt-4">
            <p className="text-md font-medium text-foreground mb-3">Available time slots for {format(selectedDate, 'PPP')}:</p>
            <ToggleGroup
              type="single"
              value={selectedTime}
              onValueChange={(value) => { if (value) handleTimeSelect(value); }}
              className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2"
            >
              {timeSlots.map(slot => (
                <ToggleGroupItem 
                    key={slot} 
                    value={slot} 
                    aria-label={slot} 
                    className="py-2.5 px-3 h-auto text-sm border data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-md"
                >
                  {slot}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t bg-secondary/30 p-4 rounded-b-lg">
         <div className="text-sm text-foreground mb-3 sm:mb-0 flex-1">
          {selectedDate && selectedTime ? (
            <span>Selected: <span className="font-semibold text-primary">{format(selectedDate, 'PPP')} at {selectedTime}</span></span>
          ) : (
            <span className="text-muted-foreground">Please select a date and time.</span>
          )}
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={onBack} className="flex-1 sm:flex-initial">Back</Button>
          <Button onClick={handleBook} disabled={!selectedDate || !selectedTime} className="flex-1 sm:flex-initial bg-green-600 hover:bg-green-700 text-white">
            Book Session
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

