import { createBooking } from "../services/bookingService.js";

export async function postBooking(req, res, next) {
  try {
    const booking = await createBooking(req.body);
    res.status(201).json({ booking });
  } catch (error) {
    next(error);
  }
}
