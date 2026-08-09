// @ts-check
const { test, expect } = require("@playwright/test");

const VIEWS = ["dashboard", "training", "nutrition", "knee", "weekly", "progress", "settings"];

test.beforeEach(async ({ page }) => {
  await page.goto("/index.html");
  await page.waitForSelector("[data-view='dashboard']:not([hidden])");
});

test("alle zeven views zijn bereikbaar zonder fouten", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  for (const view of VIEWS) {
    await page.click(`[data-nav="${view}"]`);
    await expect(page.locator(`[data-view="${view}"]`)).toBeVisible();
    await expect(page.locator(`[data-nav="${view}"]`)).toHaveAttribute("aria-pressed", "true");
  }
  expect(errors).toEqual([]);
});

test("terug-knop navigeert tussen views in plaats van de app te verlaten", async ({ page }) => {
  await page.click('[data-nav="nutrition"]');
  await expect(page.locator('[data-view="nutrition"]')).toBeVisible();
  await page.click('[data-nav="settings"]');
  await expect(page.locator('[data-view="settings"]')).toBeVisible();
  await page.goBack();
  await expect(page.locator('[data-view="nutrition"]')).toBeVisible();
  await page.goBack();
  await expect(page.locator('[data-view="dashboard"]')).toBeVisible();
});

test("laatste view wordt onthouden na herladen", async ({ page }) => {
  await page.click('[data-nav="progress"]');
  await expect(page.locator('[data-view="progress"]')).toBeVisible();
  await page.goto("/index.html");
  await expect(page.locator('[data-view="progress"]')).toBeVisible();
});

test("maaltijd afvinken toont vinkje, doorstreping en behoudt focus", async ({ page }) => {
  await page.click('[data-nav="nutrition"]');
  const checkbox = page.locator("[data-meal-check]").first();
  await checkbox.click();
  const fresh = page.locator("[data-meal-check]").first();
  await expect(fresh).toBeChecked();
  await expect(fresh.locator("xpath=ancestor::label")).toHaveClass(/is-eaten/);
  // Vinkje wordt via ::before + mask getekend
  const hasCheckmark = await fresh.evaluate(el => getComputedStyle(el, "::before").content === '""');
  expect(hasCheckmark).toBe(true);
  // Focus is niet verloren gegaan door de re-render
  const focused = await fresh.evaluate(el => document.activeElement === el);
  expect(focused).toBe(true);
});

test("lucide-iconen laden lokaal (geen extern CDN)", async ({ page }) => {
  const externalRequests = [];
  page.on("request", request => {
    if (!request.url().startsWith("http://localhost:8899")) externalRequests.push(request.url());
  });
  await page.goto("/index.html");
  await page.waitForFunction(() => document.querySelectorAll("svg.lucide").length > 0);
  expect(externalRequests).toEqual([]);
});

test("kapotte back-up sloopt de app niet en injecteert geen HTML", async ({ page }) => {
  await page.click('[data-nav="settings"]');
  const payload = {
    profile: { calories: "<img src=x onerror=window.__xss=1>", protein: 150 },
    weights: [{ value: 80 }],
    completions: {}
  };
  await page.locator("#importData").setInputFiles({
    name: "kapot.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(payload))
  });
  await expect(page.locator("#dataToast")).toContainText(/geïmporteerd|mislukt/i);
  // App staat nog overeind
  await page.click('[data-nav="dashboard"]');
  await expect(page.locator('[data-view="dashboard"]')).toBeVisible();
  // Geen XSS uitgevoerd en calorieën terug op een veilig getal
  expect(await page.evaluate(() => window.__xss)).toBeUndefined();
  await page.click('[data-nav="nutrition"]');
  await expect(page.locator("#nutritionSummary")).toContainText("2250");
});

test("versleutelde back-up: export en import via wachtwoord", async ({ page }) => {
  await page.click('[data-nav="settings"]');
  page.once("dialog", dialog => dialog.accept("geheim123"));
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.click("#exportData")
  ]);
  const content = require("fs").readFileSync(await download.path(), "utf8");
  const parsed = JSON.parse(content);
  expect(parsed.momentumEncrypted).toBe(1);
  // De inhoud is echt versleuteld: geen leesbare state-velden in het bestand
  expect(content).not.toContain("profile");
  // Import met het juiste wachtwoord herstelt de back-up
  page.once("dialog", dialog => dialog.accept("geheim123"));
  await page.locator("#importData").setInputFiles({
    name: "backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(content)
  });
  await expect(page.locator("#dataToast")).toContainText("geïmporteerd");
  // Import met een fout wachtwoord faalt netjes
  page.once("dialog", dialog => dialog.accept("verkeerd"));
  await page.locator("#importData").setInputFiles({
    name: "backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(content)
  });
  await expect(page.locator("#dataToast")).toContainText("Ontsleutelen mislukt");
});

test("weekcheck accepteert geen toekomstdatum", async ({ page }) => {
  await page.click('[data-nav="weekly"]');
  const max = await page.getAttribute("#weeklyDate", "max");
  expect(max).toBeTruthy();
  const today = new Date();
  const iso = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  expect(max).toBe(iso);
});

test("streak-statistiek staat op het dashboard", async ({ page }) => {
  await expect(page.locator("#dashboardStats")).toContainText("Weekstreak");
});

test("vorige-keer-hint verschijnt bij een tweede sessie van dezelfde training", async ({ page }) => {
  // Eerste sessie: waarden loggen en afronden
  await page.click('[data-nav="training"]');
  await page.locator('[data-view="training"] [data-start-workout]:visible').first().click();
  const firstInput = page.locator('[data-session-log][data-log-field="sets"]:visible').first();
  await firstInput.fill("3");
  const exerciseIndex = await firstInput.getAttribute("data-session-log");
  await page.locator(`[data-session-check="${exerciseIndex}"]`).check();
  page.once("dialog", dialog => dialog.accept());
  await page.click("#completeWorkout");
  // Tweede sessie van dezelfde training: hint met de vorige waarden
  await page.locator('[data-view="training"] [data-start-workout]:visible').first().click();
  await expect(page.locator(".session-previous").first()).toContainText("Vorige keer");
});

test("back-upherinnering verschijnt bij data zonder back-up en is te snoozen", async ({ page }) => {
  // Vers profiel zonder logboek: geen herinnering
  await expect(page.locator("#backupReminder")).toBeHidden();
  // Simuleer voldoende historie zonder back-up
  await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem("momentum-fitness-v1") || "{}");
    const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    state.profile = state.profile || {};
    state.weights = state.weights && state.weights.length ? state.weights : [{ date: today, value: 87.5 }];
    state.completions = state.completions || {};
    state.kneeChecks = [1, 2, 3].map(i => ({ id: String(i), date: new Date().toISOString(), day: today, before: 1, during: 1, after: 1 }));
    localStorage.setItem("momentum-fitness-v1", JSON.stringify(state));
  });
  await page.reload();
  await page.click('[data-nav="dashboard"]');
  await expect(page.locator("#backupReminder .backup-reminder")).toBeVisible();
  // Snoozen verbergt de herinnering
  await page.click("[data-backup-later]");
  await expect(page.locator("#backupReminder")).toBeHidden();
});

test("rustduur is instelbaar en wordt aangekondigd", async ({ page }) => {
  await page.click('[data-nav="training"]');
  await page.locator('[data-view="training"] [data-start-workout]:visible').first().click();
  await page.selectOption("#restDurationSelect", "90");
  await page.click("#restButton");
  await expect(page.locator("#sessionToast")).toContainText("90 seconden");
  await expect(page.locator("#restClock")).toContainText("Rust 90s");
});

test("weekrapporten staan in de voortgangsview", async ({ page }) => {
  await page.click('[data-nav="progress"]');
  await expect(page.locator("#weeklyReports .history-item").first()).toContainText(/Cyclus 1 · week \d+/);
});

test("agenda-export levert een geldig .ics-bestand", async ({ page }) => {
  await page.click('[data-nav="training"]');
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.click("#exportCalendar")
  ]);
  const content = require("fs").readFileSync(await download.path(), "utf8");
  expect(content).toContain("BEGIN:VCALENDAR");
  expect((content.match(/RRULE:FREQ=WEEKLY;BYDAY=[A-Z]{2};COUNT=12/g) || []).length).toBe(3);
});

test("eigen voeding: snelkeuze verschijnt en verwijderen is ongedaan te maken", async ({ page }) => {
  await page.click('[data-nav="nutrition"]');
  await page.click("#openCustomFood");
  await page.fill("#customFoodName", "Proteïnereep");
  await page.fill("#customFoodCalories", "200");
  await page.fill("#customFoodProtein", "20");
  await page.click("#customFoodSubmit");
  // Snelkeuze-knop verschijnt
  await expect(page.locator('[data-quick-food]')).toContainText("Proteïnereep");
  // Verwijderen toont een undo-knop in plaats van een confirm
  await page.locator("[data-delete-food]").first().click();
  await expect(page.locator("#customFoodSectionToast [data-undo]")).toBeVisible();
  await page.click("#customFoodSectionToast [data-undo]");
  await expect(page.locator("#customFoodHistory")).toContainText("Proteïnereep");
});

test("dagmenu's ruilen wisselt de menu-inhoud", async ({ page }) => {
  await page.click('[data-nav="nutrition"]');
  const before = await page.locator("#mealPlanCard .meal-name .text-small").first().textContent();
  page.once("dialog", dialog => dialog.accept());
  const otherDay = await page.locator("#mealSwapSelect option:not([value=''])").first().getAttribute("value");
  await page.selectOption("#mealSwapSelect", otherDay);
  await expect(page.locator("#nutritionQualityToast")).toContainText("geruild");
  const after = await page.locator("#mealPlanCard .meal-name .text-small").first().textContent();
  expect(after).not.toBe(before);
});

test("oefeningen hebben uitklapbare uitvoeringsinstructies met YouTube-link", async ({ page }) => {
  await page.click('[data-nav="training"]');
  // De oefeninglijst zit zelf in een "Bekijk oefeningen"-uitklapper
  await page.locator('[data-view="training"] details:has(.exercise-guide) > summary').first().click();
  const guide = page.locator('[data-view="training"] .exercise-guide').first();
  await guide.locator("summary").click();
  await expect(guide.locator(".exercise-steps li").first()).toBeVisible();
  const href = await guide.locator(".exercise-video-link").getAttribute("href");
  expect(href).toContain("youtube.com/results");
  // Ook in een actieve sessie beschikbaar
  await page.locator('[data-view="training"] [data-start-workout]:visible').first().click();
  await expect(page.locator(".session-block .exercise-guide").first()).toBeAttached();
});

test("conditiemeting: opslaan in een meetweek en terugzien in de historie", async ({ page }) => {
  await page.click('[data-nav="training"]');
  // Vers profiel start vandaag → week 1 is een meetweek
  await page.fill("#fitnessTestDistance", "2400");
  await page.click("#saveFitnessTest");
  await expect(page.locator("#fitnessTestToast")).toContainText("opgeslagen");
  await expect(page.locator("#fitnessTestCard .history-item").first()).toContainText("2400 m");
  await expect(page.locator("#fitnessTestCard .history-item").first()).toContainText("eerste meting");
});

test("dagmenu's ruilen is ongedaan te maken", async ({ page }) => {
  await page.click('[data-nav="nutrition"]');
  const before = await page.locator("#mealPlanCard .meal-name .text-small").first().textContent();
  const otherDay = await page.locator("#mealSwapSelect option:not([value=''])").first().getAttribute("value");
  await page.selectOption("#mealSwapSelect", otherDay);
  await expect(page.locator("#nutritionQualityToast")).toContainText("geruild");
  await page.click("#nutritionQualityToast [data-undo]");
  const restored = await page.locator("#mealPlanCard .meal-name .text-small").first().textContent();
  expect(restored).toBe(before);
});

test("PR-detectie meldt een nieuw record bij zwaarder gewicht", async ({ page }) => {
  await page.click('[data-nav="training"]');
  // Sessie 1: 20 kg loggen
  await page.locator('[data-view="training"] [data-start-workout]:visible').first().click();
  const weightInput = page.locator('[data-session-log][data-log-field="weight"]:visible').first();
  await weightInput.fill("20");
  const idx = await weightInput.getAttribute("data-session-log");
  await page.locator(`[data-session-check="${idx}"]`).check();
  await page.click("#completeWorkout");
  // Sessie 2: 25 kg → record
  await page.locator('[data-view="training"] [data-start-workout]:visible').first().click();
  await page.locator('[data-session-log][data-log-field="weight"]:visible').first().fill("25");
  await page.locator(`[data-session-check="${idx}"]`).check();
  await page.click("#completeWorkout");
  await expect(page.locator("#trainingToast")).toContainText("Nieuw record");
  await page.click('[data-nav="progress"]');
  await expect(page.locator(".pr-badge").first()).toBeVisible();
});
