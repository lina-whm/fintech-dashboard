import { test, expect } from "@playwright/test";

function parseMoney(text: string) { return Number(text.replace(/[^\d-]/g, "")); }

test.beforeEach(async ({ page, request }) => {
  await request.post("/api/transactions/reset");
  await page.goto("/");
});

test("adding income updates balance optimistically", async ({ page }) => {
  const balanceBefore = parseMoney(await page.getByTestId("balance-value").textContent() ?? "0");
  await page.getByLabel("Название").fill("Freelance");
  await page.getByLabel("Сумма").fill("50000");
  await page.getByText("Категория").click(); await page.getByRole("option", { name: "Other" }).click();
  await page.getByText("Тип").click(); await page.getByRole("option", { name: "Доход" }).click();
  await page.getByLabel("Дата").fill("2026-04-20");
  await page.getByTestId("submit-transaction").click();
  await expect(page.getByText("Freelance")).toBeVisible();
  const balanceAfter = parseMoney(await page.getByTestId("balance-value").textContent() ?? "0");
  expect(balanceAfter).toBe(balanceBefore + 50000);
});