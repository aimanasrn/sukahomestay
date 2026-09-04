import {
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfDay,
  isBefore,
  isWithinInterval,
  startOfDay,
  subDays,
} from "date-fns";

export type DateRange = { checkIn: Date; checkOut: Date };
export type PriceInput = {
  checkIn: Date;
  checkOut: Date;
  guests: number;
  includedGuests: number;
  weekdayPriceSen: number;
  weekendPriceSen: number;
  cleaningFeeSen: number;
  extraGuestFeeSen: number;
  seasonalRates?: Array<{
    startDate: Date;
    endDate: Date;
    nightlyPriceSen: number;
  }>;
};

export const rangesOverlap = (requested: DateRange, existing: DateRange) =>
  isBefore(requested.checkIn, existing.checkOut) &&
  isBefore(existing.checkIn, requested.checkOut);

export const calculateNights = (checkIn: Date, checkOut: Date) => {
  const nights = differenceInCalendarDays(checkOut, checkIn);
  if (nights < 1) throw new Error("Check-out must be after check-in");
  return nights;
};

export function calculatePrice(input: PriceInput) {
  const nights = calculateNights(input.checkIn, input.checkOut);
  const occupiedDays = eachDayOfInterval({
    start: input.checkIn,
    end: subDays(input.checkOut, 1),
  });
  const nightlyBreakdown = occupiedDays.map((date) => {
    const seasonal = input.seasonalRates?.find((rate) =>
      isWithinInterval(date, {
        start: startOfDay(rate.startDate),
        end: endOfDay(rate.endDate),
      }),
    );
    const weekend = date.getDay() === 5 || date.getDay() === 6;
    return {
      date,
      rateSen:
        seasonal?.nightlyPriceSen ??
        (weekend ? input.weekendPriceSen : input.weekdayPriceSen),
    };
  });
  const subtotalSen = nightlyBreakdown.reduce(
    (sum, day) => sum + day.rateSen,
    0,
  );
  const extraGuests = Math.max(0, input.guests - input.includedGuests);
  const extraGuestFeeSen = extraGuests * input.extraGuestFeeSen * nights;
  return {
    nights,
    nightlyBreakdown,
    subtotalSen,
    extraGuestFeeSen,
    cleaningFeeSen: input.cleaningFeeSen,
    totalSen: subtotalSen + extraGuestFeeSen + input.cleaningFeeSen,
  };
}

export const canCancel = (status: string, checkIn: Date, now = new Date()) =>
  ["PENDING_APPROVAL", "AWAITING_PAYMENT", "PAYMENT_SUBMITTED", "CONFIRMED"].includes(status) &&
  differenceInCalendarDays(checkIn, now) >= 3;
