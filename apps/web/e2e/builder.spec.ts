import { test, expect } from '@playwright/test';

test.describe('Builder page', () => {
	test.beforeEach(async ({ page }) => {
		// Clear any previous draft from localStorage and set language to French
		await page.goto('/builder');
		await page.evaluate(() => {
			localStorage.removeItem('aegis_draft_bo');
			localStorage.setItem('aegis_settings', JSON.stringify({ lang: 'fr', ttsEnabled: false }));
		});
		await page.reload();
	});

	test('loads the builder with a default step', async ({ page }) => {
		await expect(page.locator('h1')).toContainText('Éditeur de Build Order');
		// Default step should be present
		await expect(page.locator('input[placeholder*="moutons"]').first()).toBeVisible();
	});

	test('updates the build order name', async ({ page }) => {
		const nameInput = page.locator('input[type="text"]').first();
		await nameInput.fill('Mon Super Rush');
		await expect(nameInput).toHaveValue('Mon Super Rush');
	});

	test('adds and removes a step', async ({ page }) => {
		// Add a step
		await page.locator('button', { hasText: '+ Ajouter une étape' }).click();
		// Should now have 2 delete (✕) buttons
		await expect(page.locator('button[aria-label="Supprimer l\'étape"]')).toHaveCount(2);
		// Remove the second step
		await page.locator('button[aria-label="Supprimer l\'étape"]').nth(1).click();
		await expect(page.locator('button[aria-label="Supprimer l\'étape"]')).toHaveCount(1);
	});

	test('share button is enabled by default (all values at 0 are valid)', async ({ page }) => {
		// Default: villagerCount=0 and all resources=0, so economy is valid (0=0+0+0+0)
		await expect(page.locator('button', { hasText: 'Partager ce Build Order' })).toBeEnabled();
	});

	test('shows validation errors when economy is unbalanced', async ({ page }) => {
		// Increment food by 1 without incrementing villagerCount → food(1) ≠ villagerCount(0)
		const increments = page.locator('button', { hasText: '+' });
		await increments.nth(1).click(); // food +1
		// Error banner should now appear
		const errorBanner = page.locator('[role="alert"]');
		await expect(errorBanner).toBeVisible();
		// Share button should be disabled
		await expect(page.locator('button', { hasText: 'Partager ce Build Order' })).toBeDisabled();
	});

	test('switches between guided and table view', async ({ page }) => {
		await page.locator('button', { hasText: '📋 Tableau' }).click();
		// TableView should be visible — look for a table or specific element
		await expect(page.locator('button', { hasText: '📋 Tableau' })).toHaveClass(/bg-amber-500/);
		await page.locator('button', { hasText: '🃏 Guidée' }).click();
		await expect(page.locator('button', { hasText: '🃏 Guidée' })).toHaveClass(/bg-amber-500/);
	});

	test('shows export and import buttons', async ({ page }) => {
		await expect(page.locator('button', { hasText: 'Exporter en JSON' })).toBeVisible();
		await expect(page.locator('label', { hasText: 'Importer depuis JSON' })).toBeVisible();
	});

	test('can reset the draft', async ({ page }) => {
		// Change the name
		const nameInput = page.locator('input[type="text"]').first();
		await nameInput.fill('Test Reset');
		// Reset
		await page.locator('button', { hasText: 'Réinitialiser le brouillon' }).click();
		await expect(nameInput).toHaveValue('New Build Order');
	});
});
