const BLOCKING_STATUSES = new Set(["pending", "booked"]);
const BLOCKING_RULE_STATUSES = new Set(["blocked", "limited"]);

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

function requestConflictsWithBooking(request, booking) {
  if (!BLOCKING_STATUSES.has(booking.status)) return false;
  if (
    !overlaps(
      request.checkInDate,
      request.checkOutDate,
      booking.checkInDate,
      booking.checkOutDate
    )
  ) {
    return false;
  }

  if (request.bookingType === "whole_house") return true;

  if (request.bookingType === "homestay") {
    return (
      booking.bookingType === "whole_house" ||
      booking.bookingType === "homestay"
    );
  }

  if (booking.bookingType === "whole_house") return true;
  return booking.bookingType === "roomstay" && booking.roomId === request.roomId;
}

function requestConflictsWithRule(request, rule) {
  if (!BLOCKING_RULE_STATUSES.has(rule.status)) return false;
  if (rule.date < request.checkInDate || rule.date >= request.checkOutDate) {
    return false;
  }

  if (request.bookingType === "whole_house") return true;

  if (request.bookingType === "homestay") {
    return (
      rule.bookingType === "whole_house" ||
      rule.bookingType === "homestay"
    );
  }

  if (rule.bookingType === "whole_house") return true;

  if (rule.bookingType !== "roomstay") {
    return false;
  }

  if (!rule.roomId) {
    return true;
  }

  return rule.roomId === request.roomId;
}

export function checkAvailability({
  request,
  existingBookings,
  availabilityRules = [],
}) {
  const conflicts = existingBookings.filter((booking) => {
    return requestConflictsWithBooking(request, booking);
  });

  const conflictingRules = availabilityRules.filter((rule) => {
    return requestConflictsWithRule(request, rule);
  });

  if (conflicts.length === 0 && conflictingRules.length === 0) {
    return { available: true, conflictingBookings: [], conflictingRules: [] };
  }

  if (conflictingRules.length > 0) {
    const reason =
      request.bookingType === "whole_house"
        ? "whole_house_rule_conflict"
        : request.bookingType === "homestay"
          ? "homestay_rule_conflict"
          : "roomstay_rule_conflict";

    return {
      available: false,
      reason,
      conflictingBookings: conflicts,
      conflictingRules,
    };
  }

  const reason =
    request.bookingType === "whole_house"
      ? "whole_house_conflict"
      : request.bookingType === "homestay"
        ? "homestay_conflict"
        : "roomstay_conflict";

  return {
    available: false,
    reason,
    conflictingBookings: conflicts,
    conflictingRules: [],
  };
}
