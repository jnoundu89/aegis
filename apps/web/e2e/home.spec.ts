import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
	test('displays the library title and build orders', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('h1')).toContainText('Aegis');
		// Should list at least one build order card
		await expect(page.locator('a[href*="/aoe2/"]').first()).toBeVisible();
	});

	test('filters build orders by game', async ({ page }) => {
		await page.goto('/');
		// Get the count of all BO cards before filtering
		const allCards = page.locator('a[href*="/aoe2/"], a[href*="/aom/"]');
		const totalCount = await allCards.count();

		// Click the first game filter pill (after "All Games")
		const ageII = page.locator('button', { hasText: 'Age of Empires II' });
		await ageII.click();

		// After filtering, only aoe2 cards should be visible
		await expect(page.locator('a[href*="/aoe2/"]').first()).toBeVisible();

		// Click "All Games" to reset
		await page.locator('button', { hasText: 'All Games' }).click();
		// Total count should be restored
		await expect(allCards).toHaveCount(totalCount);
	});

	test('has a link to the builder', async ({ page }) => {
		await page.goto('/');
		const builderLink = page.locator('a[href$="/builder"]');
		await expect(builderLink).toBeVisible();
		await builderLink.click();
		await expect(page).toHaveURL(/\/builder/);
	});

	test('can navigate to a build order detail page', async ({ page }) => {
		await page.goto('/');
		const firstBO = page.locator('a[href*="/aoe2/"]').first();
		await firstBO.click();
		// Should show a step navigation UI
		await expect(page.locator('text=ÉTAPE')).toBeVisible();
	});
});
