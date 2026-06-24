import { useEffect, useMemo, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { usePublicI18n } from "@/i18n/publicI18n";
import { publicApi } from "@/services/publicApi";

function toDateKey(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMonthRange(date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return {
    startDate: toDateKey(start),
    endDate: toDateKey(end),
  };
}

export default function PublicAvailabilityCalendar({
  bookingType = "homestay",
  roomId = "",
  selectedDate,
  onSelectDate,
  onAvailableDateClick,
  className = "",
  isInteractive = true,
}) {
  const { calendarLocale } = usePublicI18n();
  const [activeStartDate, setActiveStartDate] = useState(selectedDate || new Date());
  const [blockedDates, setBlockedDates] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function loadCalendarData() {
      try {
        const range = getMonthRange(activeStartDate);
        const response = await publicApi.getAvailabilityCalendar({
          bookingType,
          roomId,
          ...range,
        });

        if (!cancelled) {
          setBlockedDates(response.blockedDates.map((item) => item.date));
        }
      } catch (_error) {
        if (!cancelled) {
          setBlockedDates([]);
        }
      }
    }

    loadCalendarData();

    return () => {
      cancelled = true;
    };
  }, [activeStartDate, bookingType, roomId]);

  const blockedSet = useMemo(() => new Set(blockedDates), [blockedDates]);

  function tileClassName({ date, view }) {
    if (view !== "month") return "";

    const key = toDateKey(date);
    if (blockedSet.has(key)) return "landing-calendar__blocked";
    if (isInteractive && selectedDate && key === toDateKey(selectedDate)) {
      return "landing-calendar__selected";
    }
    return "landing-calendar__available";
  }

  function handleDateChange(value) {
    if (!isInteractive) {
      return;
    }

    const nextDate = Array.isArray(value) ? value[0] : value;
    const dateKey = toDateKey(nextDate);

    if (blockedSet.has(dateKey)) {
      return;
    }

    onSelectDate?.(nextDate);
  }

  return (
    <div
      className={`landing-calendar rounded-[1.75rem] border border-[#ffd9bd] bg-white p-6 shadow-[0_18px_50px_rgba(255,122,26,0.08)] ${className}`.trim()}
    >
      <Calendar
        locale={calendarLocale}
        onActiveStartDateChange={({ activeStartDate: nextStartDate }) => {
          if (nextStartDate) {
            setActiveStartDate(nextStartDate);
          }
        }}
        onChange={handleDateChange}
        tileClassName={tileClassName}
        tileDisabled={({ date, view }) =>
          view === "month" && isInteractive && blockedSet.has(toDateKey(date))
        }
        value={null}
      />
    </div>
  );
}
