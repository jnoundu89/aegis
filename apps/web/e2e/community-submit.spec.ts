import { test, expect } from '@playwright/test';

/**
 * Intercepts the Supabase REST insert call for community_builds and returns a
 * mock successful response containing a generated UUID.
 */
const MOCK_UUID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

async function mockSupabaseInsert(page: import('@playwright/test').Page) {
	await page.route('**/rest/v1/community_builds**', async (route) => {
		if (route.request().method() === 'POST') {
			await route.fulfill({
				status: 201,
				contentType: 'application/json',
				body: JSON.stringify({ id: MOCK_UUID }),
			});
		} else {
			await route.continue();
		}
	});
}

/**
 * Navigates to the builder, sets language to French, clears any saved draft,
 * and fills in a complete, valid build order ready for submission.
 *
 * The invented build order is an AoE2 "Fast Castle Rush" strategy:
 *   - Name:        Fast Castle Rush
 *   - Civilization: Franks
 *   - Author:      TestPlayer
 *   - Step 1:      6 moutons – Start collecting food with sheep (villagerCount=3, food=3)
 *   - Step 2:      Âge Féodal – Send two villagers to wood and advance (villagerCount=5, food=3, wood=2)
 */
async function buildFastCastleOrder(page: import('@playwright/test').Page) {
	await page.goto('/builder');
	await page.evaluate(() => {
		localStorage.removeItem('aegis_draft_bo');
		localStorage.setItem('aegis_settings', JSON.stringify({ lang: 'fr', ttsEnabled: false }));
	});
	await page.reload();

	// Build order name
	const nameInput = page.locator('input[type="text"]').first();
	await nameInput.fill('Fast Castle Rush');

	// Author
	await page.locator('input[placeholder*="Your name"]').fill('TestPlayer');

	// Civilization
	await page.locator('input[placeholder*="Britons"]').fill('Franks');

	// Step 1 label & description
	const labelInput = page.locator('input[placeholder*="moutons"]').first();
	await labelInput.fill('6 moutons');
	const descArea = page.locator('textarea').first();
	await descArea.fill('Envoyer 3 villageois sur la nourriture');

	// Set villagerCount=3, food=3 so the economy validates (3 = 3+0+0+0)
	const increments = page.locator('button', { hasText: '+' });
	// villagerCount +3
	for (let i = 0; i < 3; i++) await increments.nth(0).click();
	// food +3
	for (let i = 0; i < 3; i++) await increments.nth(1).click();
}

test.describe('Submit Build Order to Community', () => {
	test.beforeEach(async ({ page }) => {
		await buildFastCastleOrder(page);
	});

	// ── Modal open / close ─────────────────────────────────────────────────────

	test('opens the submit modal when clicking "📤 Soumettre à la communauté"', async ({ page }) => {
		await page.locator('button', { hasText: 'Soumettre à la communauté' }).click();

		const dialog = page.locator('[role="dialog"]');
		await expect(dialog).toBeVisible();
		await expect(dialog.locator('h3')).toContainText('Soumettre à la communauté');
	});

	test('displays the build order summary inside the modal', async ({ page }) => {
		await page.locator('button', { hasText: 'Soumettre à la communauté' }).click();

		const dialog = page.locator('[role="dialog"]');
		await expect(dialog).toContainText('Fast Castle Rush');
		await expect(dialog).toContainText('Franks');
		await expect(dialog).toContainText('TestPlayer');
	});

	test('closes the modal with the Cancel button', async ({ page }) => {
		await page.locator('button', { hasText: 'Soumettre à la communauté' }).click();
		await expect(page.locator('[role="dialog"]')).toBeVisible();

		await page.locator('[role="dialog"] button', { hasText: 'Annuler' }).click();

		await expect(page.locator('[role="dialog"]')).not.toBeVisible();
	});

	test('closes the modal with the Escape key', async ({ page }) => {
		await page.locator('button', { hasText: 'Soumettre à la communauté' }).click();
		await expect(page.locator('[role="dialog"]')).toBeVisible();

		await page.keyboard.press('Escape');

		await expect(page.locator('[role="dialog"]')).not.toBeVisible();
	});

	test('closes the modal by clicking the backdrop', async ({ page }) => {
		await page.locator('button', { hasText: 'Soumettre à la communauté' }).click();
		await expect(page.locator('[role="dialog"]')).toBeVisible();

		// Click the semi-transparent backdrop (the outer fixed div, not the dialog itself)
		await page.mouse.click(10, 10);

		await expect(page.locator('[role="dialog"]')).not.toBeVisible();
	});

	// ── Form validation ────────────────────────────────────────────────────────

	test('"Submit for review" button is disabled before the rules checkbox is checked', async ({ page }) => {
		await page.locator('button', { hasText: 'Soumettre à la communauté' }).click();

		const submitBtn = page.locator('[role="dialog"] button', { hasText: 'Soumettre pour examen' });
		await expect(submitBtn).toBeDisabled();
	});

	test('"Submit for review" button is enabled after accepting the rules', async ({ page }) => {
		await page.locator('button', { hasText: 'Soumettre à la communauté' }).click();

		await page.locator('[role="dialog"] input[type="checkbox"]').check();

		const submitBtn = page.locator('[role="dialog"] button', { hasText: 'Soumettre pour examen' });
		await expect(submitBtn).toBeEnabled();
	});

	test('can fill in the optional email field', async ({ page }) => {
		await page.locator('button', { hasText: 'Soumettre à la communauté' }).click();

		const emailInput = page.locator('[role="dialog"] input[type="email"]');
		await emailInput.fill('joueur@exemple.com');
		await expect(emailInput).toHaveValue('joueur@exemple.com');
	});

	// ── Full happy-path submission (mocked Supabase) ───────────────────────────

	test('full submission flow: fills fields, submits, and shows the tracking ID', async ({ page }) => {
		await mockSupabaseInsert(page);

		// Open modal
		await page.locator('button', { hasText: 'Soumettre à la communauté' }).click();
		const dialog = page.locator('[role="dialog"]');
		await expect(dialog).toBeVisible();

		// Optional email
		await dialog.locator('input[type="email"]').fill('joueur@exemple.com');

		// Accept community guidelines
		await dialog.locator('input[type="checkbox"]').check();

		// Submit
		await dialog.locator('button', { hasText: 'Soumettre pour examen' }).click();

		// Success: tracking ID should be visible in the success screen
		await expect(dialog).toContainText(MOCK_UUID);
		await expect(dialog.locator('button', { hasText: 'OK' })).toBeVisible();
	});

	test('clicking OK on the success screen closes the modal', async ({ page }) => {
		await mockSupabaseInsert(page);

		await page.locator('button', { hasText: 'Soumettre à la communauté' }).click();
		const dialog = page.locator('[role="dialog"]');

		await dialog.locator('input[type="checkbox"]').check();
		await dialog.locator('button', { hasText: 'Soumettre pour examen' }).click();

		await expect(dialog.locator('button', { hasText: 'OK' })).toBeVisible();
		await dialog.locator('button', { hasText: 'OK' }).click();

		await expect(dialog).not.toBeVisible();
	});

	// ── Submit button disabled state on builder page ───────────────────────────

	test('"Submit to Community" button on builder is disabled when economy is invalid', async ({ page }) => {
		// Increment food without incrementing villagerCount to create an imbalance
		// (builder already has villagerCount=3, food=3 from beforeEach; increment food once more)
		const increments = page.locator('button', { hasText: '+' });
		await increments.nth(1).click(); // food +1 → food=4, villagerCount=3 → invalid

		const submitBtn = page.locator('button', { hasText: 'Soumettre à la communauté' });
		await expect(submitBtn).toBeDisabled();
	});
});
