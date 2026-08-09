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
