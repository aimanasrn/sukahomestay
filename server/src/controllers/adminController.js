import {
  createAvailabilityRule,
  deleteAvailabilityRule,
  getAdminAvailabilityRules,
  getAdminBookings,
  getAdminProperties,
  getDashboardSummary,
  updateBookingStatus,
} from "../services/adminService.js";

export async function getAdminDashboard(req, res, next) {
  try {
    const summary = await getDashboardSummary();
    res.json(summary);
  } catch (error) {
    next(error);
  }
}

export async function getBookingsAdmin(req, res, next) {
  try {
    const bookings = await getAdminBookings();
    res.json({ bookings });
  } catch (error) {
    next(error);
  }
}

export async function patchBookingAdmin(req, res, next) {
  try {
    const booking = await updateBookingStatus(req.params.bookingId, req.body);
    res.json({ booking });
  } catch (error) {
    next(error);
  }
}

export async function getAvailabilityRulesAdmin(req, res, next) {
  try {
    const rules = await getAdminAvailabilityRules();
    res.json({ rules });
  } catch (error) {
    next(error);
  }
}

export async function postAvailabilityRuleAdmin(req, res, next) {
  try {
    const rule = await createAvailabilityRule(req.body);
    res.status(201).json({ rule });
  } catch (error) {
    next(error);
  }
}

export async function deleteAvailabilityRuleAdmin(req, res, next) {
  try {
    const result = await deleteAvailabilityRule(req.params.ruleId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getPropertiesAdmin(req, res, next) {
  try {
    const properties = await getAdminProperties();
    res.json({ properties });
  } catch (error) {
    next(error);
  }
}
