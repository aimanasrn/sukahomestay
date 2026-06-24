const API_BASE_URL = `${
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000"
}/api`;

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || "Request failed");
  }

  return data;
}

export const publicApi = {
  getProperties: () => request("/properties"),
  getHomestay: () => request("/properties/homestay"),
  getRoomstay: () => request("/properties/roomstay"),
  getAvailabilityCalendar: (params) =>
    request(`/availability/calendar?${new URLSearchParams(params).toString()}`),
  checkAvailability: (params) =>
    request(`/availability?${new URLSearchParams(params).toString()}`),
  createBooking: (payload) =>
    request("/bookings", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
