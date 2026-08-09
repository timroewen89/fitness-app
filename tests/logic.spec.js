// @ts-check
// Unit-tests voor de pure logica in logic.js — draaien in Node, zonder browser.
const { test, expect } = require("@playwright/test");
const L = require("../logic.js");

test.describe("isIsoDay", () => {
  test("accepteert alleen geldige ISO-dagen", () => {
    expect(L.isIsoDay("2026-08-09")).toBe(true);
    expect(L.isIsoDay("2026-8-9")).toBe(false);
    expect(L.isIsoDay("2026-08-09T12:00:00")).toBe(false);
    expect(L.isIsoDay(20260809)).toBe(false);
    expect(L.isIsoDay(null)).toBe(false);
  });
});

test.describe("programPosition", () => {
  test("week wisselt om middernacht, niet halverwege de dag", () => {
    expect(L.programPosition("2026-01-05", "2026-01-11")).toEqual({ week: 1, cycle: 1 });
    expect(L.programPosition("2026-01-05", "2026-01-12")).toEqual({ week: 2, cycle: 1 });
  });

  test("cyclus rolt door na week 12", () => {
    expect(L.programPosition("2026-01-05", "2026-03-29")).toEqual({ week: 12, cycle: 1 });
    expect(L.programPosition("2026-03-30", "2026-03-30")).toEqual({ week: 1, cycle: 1 });
    expect(L.programPosition("2026-01-05", "2026-03-30")).toEqual({ week: 1, cycle: 2 });
  });

  test("DST-overgang verschuift de weekgrens niet (EU, maart)", () => {
    // 2026-03-29 is de Europese zomertijd-overgang
    expect(L.programPosition("2026-03-23", "2026-03-29")).toEqual({ week: 1, cycle: 1 });
    expect(L.programPosition("2026-03-23", "2026-03-30")).toEqual({ week: 2, cycle: 1 });
  });

  test("dagen vóór de start blijven week 1", () => {
    expect(L.programPosition("2026-01-05", "2025-12-25")).toEqual({ week: 1, cycle: 1 });
  });
});

test.describe("scaleMealDescription", () => {
  test("schaal 1 laat de tekst ongemoeid", () => {
    const text = "80 g havermout met 250 ml melk";
    expect(L.scaleMealDescription(text, 1, 1)).toBe(text);
  });

  test("stuk-items met bijvoeglijk naamwoord schalen mee", () => {
    expect(L.scaleMealDescription("4 volkoren boterhammen", 1.29, 1)).toBe("5 volkoren boterhammen");
  });

  test("pindakaas schaalt als energie, niet als eiwit (kaas-substring)", () => {
    expect(L.scaleMealDescription("30 g pindakaas", 1.29, 2)).toBe("40 g pindakaas");
  });

  test("eiwitbronnen volgen de eiwitschaal", () => {
    expect(L.scaleMealDescription("250 g magere kwark", 1, 1.2)).toBe("300 g magere kwark");
  });

  test("grammen worden op 5 afgerond, stuks op hele aantallen", () => {
    expect(L.scaleMealDescription("80 g havermout", 1.1, 1)).toBe("90 g havermout");
    expect(L.scaleMealDescription("2 eieren", 1, 1.4)).toBe("3 eieren");
  });

  test("getallen zonder herkenbare eenheid blijven staan", () => {
    expect(L.scaleMealDescription("3 gele paprika's", 1.5, 1.5)).toBe("3 gele paprika's");
  });
});

test.describe("exerciseLogType en exerciseFields", () => {
  test("herkent de vier logtypes", () => {
    expect(L.exerciseLogType(["Circuit", "3 rondes", ""])).toBe("rounds");
    expect(L.exerciseLogType(["Plank", "3 × 20–35 sec", ""])).toBe("timed");
    expect(L.exerciseLogType(["Rustig fietsen", "7 min", ""])).toBe("cardio");
    expect(L.exerciseLogType(["Chest press", "3 × 8–12", ""])).toBe("strength");
  });

  test("krachtvelden bevatten sets, herhalingen en gewicht", () => {
    const keys = L.exerciseFields(["Chest press", "3 × 8–12", ""]).map(field => field[0]);
    expect(keys).toEqual(["sets", "reps", "weight"]);
  });
});

test.describe("formatPreviousLog", () => {
  const strength = ["Chest press", "3 × 8–12", ""];

  test("volledige krachtlog", () => {
    expect(L.formatPreviousLog(strength, { sets: "3", reps: "10", weight: "24" })).toBe("3×10 @ 24 kg");
  });

  test("gedeeltelijke log toont wat er is", () => {
    expect(L.formatPreviousLog(strength, { sets: "3" })).toBe("3 sets");
    expect(L.formatPreviousLog(strength, { weight: "24" })).toBe("@ 24 kg");
  });

  test("cardio en rondes", () => {
    expect(L.formatPreviousLog(["Rustig fietsen", "7 min", ""], { minutes: "30", distance: "8" })).toBe("30 min, 8 km");
    expect(L.formatPreviousLog(["Circuit", "3 rondes", ""], { rounds: "4" })).toBe("4 rondes");
  });

  test("lege log geeft lege string", () => {
    expect(L.formatPreviousLog(strength, {})).toBe("");
  });
});
