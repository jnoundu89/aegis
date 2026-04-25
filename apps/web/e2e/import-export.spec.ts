import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import os from 'os';

const VALID_BO = {
	id: 'test_import_bo',
	gameId: 'aoe2',
	name: 'BO Importé Test',
	steps: [
		{
			id: 1,
			label: 'Démarrage',
			description: 'Envoyer villageois sur mouton',
			villagerCount: 3,
			food: 3,
			wood: 0,
			gold: 0,
			stone: 0,
		},
	],
};

test.describe('Import / Export JSON', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/builder');
		await page.evaluate(() => {
			localStorage.removeItem('aegis_draft_bo');
			localStorage.setItem('aegis_settings', JSON.stringify({ lang: 'fr', ttsEnabled: false }));
		});
		await page.reload();
	});

	test('export button downloads a JSON file', async ({ page }) => {
		// Listen for the download event
		const downloadPromise = page.waitForEvent('download');
		await page.locator('button', { hasText: 'Exporter en JSON' }).click();
		const download = await downloadPromise;

		// Check filename ends with .json
		expect(download.suggestedFilename()).toMatch(/\.json$/);

		// Read downloaded content
		const downloadPath = await download.path();
		const content = JSON.parse(fs.readFileSync(downloadPath!, 'utf-8'));
		expect(content).toHaveProperty('id');
		expect(content).toHaveProperty('steps');
		expect(Array.isArray(content.steps)).toBe(true);
	});

	test('import replaces the current build order with the file content', async ({ page }) => {
		// Write a temp JSON file
		const tmpDir = os.tmpdir();
		const tmpFile = path.join(tmpDir, 'test_import_bo.json');
		fs.writeFileSync(tmpFile, JSON.stringify(VALID_BO));

		// Use the hidden file input to upload
		const fileInput = page.locator('[data-testid="import-file-input"]');
		await fileInput.setInputFiles(tmpFile);

		// The name input should now reflect the imported BO name
		const nameInput = page.locator('input[type="text"]').first();
		await expect(nameInput).toHaveValue('BO Importé Test');

		// Clean up
		fs.unlinkSync(tmpFile);
	});

	test('import shows an error for invalid JSON', async ({ page }) => {
		const tmpDir = os.tmpdir();
		const tmpFile = path.join(tmpDir, 'bad_bo.json');
		fs.writeFileSync(tmpFile, '{ invalid json }');

		const fileInput = page.locator('[data-testid="import-file-input"]');
		await fileInput.setInputFiles(tmpFile);

		await expect(page.locator('[role="alert"]')).toBeVisible();
		await expect(page.locator('text=Erreur de lecture')).toBeVisible();

		fs.unlinkSync(tmpFile);
	});

	test('import shows an error for valid JSON that fails schema validation', async ({ page }) => {
		const tmpDir = os.tmpdir();
		const tmpFile = path.join(tmpDir, 'schema_fail_bo.json');
		fs.writeFileSync(tmpFile, JSON.stringify({ id: '', steps: [] }));

		const fileInput = page.locator('[data-testid="import-file-input"]');
		await fileInput.setInputFiles(tmpFile);

		await expect(page.locator('[role="alert"]')).toBeVisible();
		await expect(page.locator('text=Fichier invalide')).toBeVisible();

		fs.unlinkSync(tmpFile);
	});

	test('export of a named BO has a meaningful filename', async ({ page }) => {
		// Set a custom name
		const nameInput = page.locator('input[type="text"]').first();
		await nameInput.fill('Mon Rush Archers');

		const downloadPromise = page.waitForEvent('download');
		await page.locator('button', { hasText: 'Exporter en JSON' }).click();
		const download = await downloadPromise;

		expect(download.suggestedFilename()).toBe('Mon_Rush_Archers.json');
	});
});
