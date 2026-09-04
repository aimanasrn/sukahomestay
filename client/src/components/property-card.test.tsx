import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { PropertyCard } from "./property-card";
import { properties } from "@/lib/demo-data";
describe("PropertyCard", () => {
  it("shows property details and booking price", () => {
    render(
      <MemoryRouter>
        <PropertyCard property={properties[0]!} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Alam Villa Langkawi")).toBeInTheDocument();
    expect(screen.getByText(/RM\s?620/)).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/properties/alam-villa-langkawi",
    );
  });
});
