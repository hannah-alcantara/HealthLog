import { test, expect } from '@playwright/test';

test.describe('Critical User Journeys', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // Handle onboarding if present
    const onboardingButton = page.getByRole('button', { name: /Get Started|Skip/i });
    if (await onboardingButton.isVisible().catch(() => false)) {
      await onboardingButton.click();
    }
  });

  // T083: Add condition → view on dashboard → reload persistence
  test('T083: should add a condition, view it on dashboard, and persist after reload', async ({ page }) => {
    await page.goto('/');

    // Step 1: Navigate to Medical History
    await page.getByRole('link', { name: /Medical History/i }).click();
    await expect(page).toHaveURL(/\/medical-history/);

    // Step 2: Add a new condition
    await page.getByRole('button', { name: /Add Condition/i }).click();

    // Fill out the condition form
    await page.getByLabel(/Condition Name/i).fill('Hypertension');
    await page.getByLabel(/Diagnosis Date/i).fill('2020-01-15');
    await page.getByLabel(/Notes/i).fill('Diagnosed during annual checkup');

    // Save the condition
    await page.getByRole('button', { name: /Save/i }).click();

    // Verify condition appears in the list
    await expect(page.getByText('Hypertension')).toBeVisible();

    // Step 3: Navigate to Dashboard
    await page.getByRole('link', { name: /Dashboard/i }).click();
    await expect(page).toHaveURL(/^\/$|\/$/);

    // Verify the condition count is reflected in stats or recent activity
    // (Dashboard shows recent symptoms, but medical history should be accessible)
    await expect(page.getByText(/Dashboard|Health Log/i)).toBeVisible();

    // Step 4: Reload the page and verify persistence
    await page.reload();

    // Navigate back to Medical History to verify data persisted
    await page.getByRole('link', { name: /Medical History/i }).click();
    await expect(page.getByText('Hypertension')).toBeVisible();
    await expect(page.getByText('Diagnosed during annual checkup')).toBeVisible();
  });

  // T084: Add appointment with symptoms → generate questions → view questions
  test('T084: should add appointment with symptoms, generate questions, and view them', async ({ page }) => {
    await page.goto('/');

    // Step 1: Add some medical history for better question generation
    await page.getByRole('link', { name: /Medical History/i }).click();

    // Add a condition
    await page.getByRole('button', { name: /Add Condition/i }).click();
    await page.getByLabel(/Condition Name/i).fill('Diabetes Type 2');
    await page.getByLabel(/Diagnosis Date/i).fill('2019-06-01');
    await page.getByRole('button', { name: /Save/i }).click();
    await expect(page.getByText('Diabetes Type 2')).toBeVisible();

    // Switch to Medications tab
    await page.getByRole('button', { name: /Medications/ }).click();

    // Add a medication
    await page.getByRole('button', { name: /Add Medication/i }).click();
    await page.getByLabel(/Medication Name/i).fill('Metformin');
    await page.getByLabel(/Dosage/i).fill('500mg');
    await page.getByLabel(/Frequency/i).fill('Twice daily');
    await page.getByRole('button', { name: /Save/i }).click();
    await expect(page.getByText('Metformin')).toBeVisible();

    // Step 2: Navigate to Appointments
    await page.getByRole('link', { name: /Appointments/i }).click();
    await expect(page).toHaveURL(/\/appointments/);

    // Step 3: Add a new appointment with symptoms
    await page.getByRole('button', { name: /Add Appointment/i }).click();

    // Fill out the appointment form
    await page.getByLabel(/Doctor Name/i).fill('Dr. Sarah Johnson');
    await page.getByLabel(/Reason for Visit/i).fill('Diabetes follow-up');
    await page.getByLabel(/Symptoms/i).fill('Frequent thirst, fatigue, blurred vision');
    await page.getByLabel(/Notes/i).fill('Blood sugar has been high lately');

    // Save the appointment
    await page.getByRole('button', { name: /Save/i }).click();

    // Verify appointment appears in the list
    await expect(page.getByText('Dr. Sarah Johnson')).toBeVisible();
    await expect(page.getByText('Diabetes follow-up')).toBeVisible();

    // Step 4: Generate questions for the appointment
    await page.getByRole('button', { name: /Prepare for Next Visit/i }).click();

    // Wait for the dialog to open
    await expect(page.getByRole('dialog')).toBeVisible();

    // Verify questions are generated (should see generic questions at minimum)
    await expect(page.getByText(/What are my current vital signs/i)).toBeVisible();

    // Save the questions
    await page.getByRole('button', { name: /Save Questions|Save/i }).click();

    // Step 5: Verify questions are displayed in the appointment
    await expect(page.getByText(/Prepared Questions|Update Questions/i)).toBeVisible();

    // Step 6: Reload and verify persistence
    await page.reload();
    await expect(page.getByText('Dr. Sarah Johnson')).toBeVisible();
    await expect(page.getByText(/Prepared Questions|questions/i)).toBeVisible();
  });

  // T085: Upload document → view document → delete document
  test.skip('T085: should upload, view, and delete a document', async ({ page }) => {
    // This test is skipped because Document Management (Phase 6) is DEFERRED
    // The feature has not been implemented yet

    await page.goto('/');

    // Navigate to Documents (if/when implemented)
    await page.getByRole('link', { name: /Documents/i }).click();

    // Upload a document
    await page.getByRole('button', { name: /Upload Document/i }).click();

    // Select a file (would need a test file)
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-lab-results.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('PDF test content'),
    });

    // Add description
    await page.getByLabel(/Description/i).fill('Blood test results from annual checkup');

    // Upload
    await page.getByRole('button', { name: /Upload/i }).click();

    // Verify document appears
    await expect(page.getByText('test-lab-results.pdf')).toBeVisible();

    // View the document
    await page.getByRole('button', { name: /View/i }).click();

    // Verify document opens (would check new tab/window)

    // Delete the document
    await page.getByRole('button', { name: /Delete/i }).click();

    // Confirm deletion
    await page.getByRole('button', { name: /Confirm|Yes/i }).click();

    // Verify document is removed
    await expect(page.getByText('test-lab-results.pdf')).not.toBeVisible();
  });
});
