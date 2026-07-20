import { render, screen } from "@testing-library/react";
import Home from "./page";

it("renders the Univers Atlas application name", () => {
  render(<Home />);
  expect(screen.getByRole("heading", { name: "Univers Atlas" })).toBeInTheDocument();
});
