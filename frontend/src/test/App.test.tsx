import { describe, it, expect, vi, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App";

vi.stubGlobal(
  "fetch",
  vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ has_cookies: false, source: null }),
  })
);

afterEach(() => {
  vi.clearAllMocks();
});

describe("App", () => {
  it("renders without crashing", () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    expect(document.body).toBeTruthy();
  });
});
