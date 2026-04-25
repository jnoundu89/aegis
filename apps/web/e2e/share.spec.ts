import { test, expect } from '@playwright/test';

/**
 * Creates a valid build order step in the builder:
 * - fills label and description
 * - sets villagerCount = food + wood + gold + stone to pass economy validation
 */
async function fillValidStep(page: import('@playwright/test').Page, stepIndex = 0) {
	// Ensure French language is set before interacting with French UI text
	await page.evaluate(() => {
		localStorage.setItem('aegis_settings', JSON.stringify({ lang: 'fr', ttsEnabled: false }));
	});
	await page.reload();

	const labelInputs = page.locator('input[placeholder*="moutons"]');
	await labelInputs.nth(stepIndex).fill('6 moutons');

	const descriptionAreas = page.locator('textarea');
	await descriptionAreas.nth(stepIndex).fill('Envoyer 3 villageois sur la nourriture');

	// Adjust villagerCount to match total resources (food=3, wood=0, gold=0, stone=0 → pop=3)
	// villagerCount starts at 0. We need to increment food to 3 and villagerCount to 3.
	const increments = page.locator('button', { hasText: '+' });
	// First increment group is villagerCount, then food, wood, gold, stone
	// Click food + three times (second resource row increment)
	await increments.nth(1).click(); // food +1
	await increments.nth(1).click(); // food +1
	await increments.nth(1).click(); // food +1
	// Click villagerCount + three times
	await increments.nth(0).click(); // villagerCount +1
	await increments.nth(0).click(); // villagerCount +1
	await increments.nth(0).click(); // villagerCount +1
}

test.describe('Share build order', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/builder');
		await page.evaluate(() => {
			localStorage.removeItem('aegis_draft_bo');
			localStorage.setItem('aegis_settings', JSON.stringify({ lang: 'fr', ttsEnabled: false }));
		});
		await page.reload();
	});

	test('generates a share URL when the build order is valid', async ({ page }) => {
		await fillValidStep(page);

		// Share button should now be enabled
		const shareBtn = page.locator('button', { hasText: 'Partager ce Build Order' });
		await expect(shareBtn).toBeEnabled();
		await shareBtn.click();

		// The share URL link should appear
		const shareLink = page.locator('[data-testid="share-url"]');
		await expect(shareLink).toBeVisible();

		const href = await shareLink.getAttribute('href');
		expect(href).toContain('/share?data=');
	});

	test('share link navigates to the correct build order', async ({ page }) => {
		await fillValidStep(page);

		// Set a recognisable name
		await page.locator('input[type="text"]').first().fill('BO Partagé Test');

		const shareBtn = page.locator('button', { hasText: 'Partager ce Build Order' });
		await expect(shareBtn).toBeEnabled();
		await shareBtn.click();

		const shareLink = page.locator('[data-testid="share-url"]');
		await expect(shareLink).toBeVisible();

		const href = await shareLink.getAttribute('href');
		expect(href).toBeTruthy();

		// Navigate to the share URL
		await page.goto(href!);

		// Should display the BO name
		await expect(page.locator('h1')).toContainText('BO Partagé Test');

		// Should show the step navigation
		await expect(page.locator('text=ÉTAPE')).toBeVisible();
		await expect(page.locator('text=1 / 1')).toBeVisible();
	});

	test('shows an error page for an invalid share link', async ({ page }) => {
		await page.goto('/share?data=invaliddata');
		await expect(page.locator('[role="alert"]')).toBeVisible();
		await expect(page.locator('text=Lien de partage invalide')).toBeVisible();
	});

	test('shared build order can be saved to local builds', async ({ page }) => {
		await fillValidStep(page);
		await page.locator('input[type="text"]').first().fill('BO Pour Sauvegarder');

		const shareBtn = page.locator('button', { hasText: 'Partager ce Build Order' });
		await expect(shareBtn).toBeEnabled();
		await shareBtn.click();

		const shareLink = page.locator('[data-testid="share-url"]');
		const href = await shareLink.getAttribute('href');
		await page.goto(href!);

		// Click the "Sauvegarder dans mes BO locaux" button
		const saveBtn = page.locator('button', { hasText: 'Sauvegarder dans mes BO locaux' });
		await expect(saveBtn).toBeVisible();
		await saveBtn.click();

		// Confirmation should appear
		await expect(page.locator('text=Build Order sauvegardé dans vos BO locaux')).toBeVisible();
	});
});
