// vitest.setup.ts
import { vi } from "vitest";

vi.mock("@/lib/supabase", () => ({
  default: {
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    })),
  },
}));

window.HTMLElement.prototype.scrollIntoView = vi.fn();
