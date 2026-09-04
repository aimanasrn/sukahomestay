import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CheckoutPage } from "./checkout-page";

describe("checkout reservation safety", () => {
  afterEach(() => vi.restoreAllMocks());

  it("does not open WhatsApp or submit while required agreements are invalid", async () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ success: true, data: { nights: 3, subtotalSen: 186000, cleaningFeeSen: 9000, extraGuestFeeSen: 0, totalSen: 195000 }, message: "ok" }), { status: 200, headers: { "Content-Type": "application/json" } }));
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={client}><MemoryRouter><CheckoutPage /></MemoryRouter></QueryClientProvider>);
    const button = screen.getByRole("button", { name: "Reserve via WhatsApp" });
    expect(button).toBeDisabled();
    fireEvent.submit(button.closest("form")!);
    expect(open).not.toHaveBeenCalled();
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
  });
});
