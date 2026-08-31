import { describe, expect, it } from "vitest";
import { sortEntourage, type OrderableEntourageMember } from "./entourage-order";

function member(
  name: string,
  orderRank?: string | null,
): OrderableEntourageMember {
  return { name, orderRank };
}

const names = (members: OrderableEntourageMember[]) => members.map((m) => m.name);

describe("sortEntourage", () => {
  it("follows the Studio drag rank", () => {
    const sorted = sortEntourage([
      member("Carlos Reyes", "0|c"),
      member("Ana Cruz", "0|a"),
      member("Bea Lim", "0|b"),
    ]);

    expect(names(sorted)).toEqual(["Ana Cruz", "Bea Lim", "Carlos Reyes"]);
  });

  it("ignores first names when a rank is set", () => {
    const sorted = sortEntourage([
      member("Zoe Abad", "0|a"),
      member("Ana Zamora", "0|b"),
    ]);

    expect(names(sorted)).toEqual(["Zoe Abad", "Ana Zamora"]);
  });

  it("falls back to last name for unranked members", () => {
    const sorted = sortEntourage([
      member("Ana Zamora"),
      member("Zoe Abad"),
      member("Bea Lim", null),
    ]);

    expect(names(sorted)).toEqual(["Zoe Abad", "Bea Lim", "Ana Zamora"]);
  });

  it("breaks a shared last name on the full name", () => {
    const sorted = sortEntourage([
      member("Zoe Santos"),
      member("Ana Santos"),
    ]);

    expect(names(sorted)).toEqual(["Ana Santos", "Zoe Santos"]);
  });

  it("sorts unranked members after ranked ones", () => {
    const sorted = sortEntourage([
      member("Ana Abad"),
      member("Zoe Zamora", "0|a"),
    ]);

    expect(names(sorted)).toEqual(["Zoe Zamora", "Ana Abad"]);
  });

  it("uses the last word of a multi-word name as the last name", () => {
    const sorted = sortEntourage([
      member("Maria Clara de Guzman"),
      member("Juan Bautista"),
    ]);

    expect(names(sorted)).toEqual(["Juan Bautista", "Maria Clara de Guzman"]);
  });

  it("does not mutate the input array", () => {
    const input = [member("Bea Lim", "0|b"), member("Ana Cruz", "0|a")];
    sortEntourage(input);

    expect(names(input)).toEqual(["Bea Lim", "Ana Cruz"]);
  });
});
