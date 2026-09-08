import { describe, expect, it } from "vitest";
import { splitName } from "./splitName";

describe("splitName", () => {
  it("splits on the last space so multi-word first names survive", () => {
    expect(splitName("Maria Cristina Reyes")).toEqual({
      firstName: "Maria Cristina",
      lastName: "Reyes",
    });
  });

  it("treats a single word as a first name with no last name", () => {
    expect(splitName("Jane")).toEqual({ firstName: "Jane", lastName: null });
  });

  it("ignores surrounding and repeated whitespace", () => {
    expect(splitName("  Jane   Doe ")).toEqual({ firstName: "Jane", lastName: "Doe" });
  });
});
