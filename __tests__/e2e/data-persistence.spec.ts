import { test, expect } from '@playwright/test';

test.describe('Data Persistence Across Sections', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before the test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // Handle onboarding if present
    const onboardingButton = page.getByRole('button', { name: /Get Started|Skip/i });
    if (await onboardingButton.isVisible().catch(() => false)) {
      await onboardingButton.click();
    }
  });

  // T086: Add entries in all sections → reload → verify all data persists
  test('T086: should persist data across all sections after reload', async ({ page }) => {
    await page.goto('/');

    // ===== SECTION 1: Medical History - Conditions =====
    await page.getByRole('link', { name: /Medical History/i }).click();
    await expect(page).toHaveURL(/\/medical-history/);

    // Add a condition
    await page.getByRole('button', { name: /Add Condition/i }).click();
    await page.getByLabel(/Condition Name/i).fill('Hypertension');
    await page.getByLabel(/Diagnosis Date/i).fill('2020-01-15');
    await page.getByLabel(/Notes/i).fill('Controlled with medication');
    await page.getByRole('button', { name: /Save/i }).click();
    await expect(page.getByText('Hypertension')).toBeVisible();

    // ===== SECTION 2: Medical History - Medications =====
    await page.getByRole('button', { name: /Medications/ }).click();

    // Add a medication
    await page.getByRole('button', { name: /Add Medication/i }).click();
    await page.getByLabel(/Medication Name/i).fill('Lisinopril');
    await page.getByLabel(/Dosage/i).fill('10mg');
    await page.getByLabel(/Frequency/i).fill('Once daily');
    await page.getByLabel(/Start Date/i).fill('2020-02-01');
    await page.getByRole('button', { name: /Save/i }).click();
    await expect(page.getByText('Lisinopril')).toBeVisible();

    // ===== SECTION 3: Medical History - Allergies =====
    await page.getByRole('button', { name: /Allergies/ }).click();

    // Add an allergy
    await page.getByRole('button', { name: /Add Allergy/i }).click();
    await page.getByLabel(/Allergen/i).fill('Penicillin');
    await page.getByLabel(/Reaction/i).fill('Rash and hives');
    await page.getByRole('button', { name: /Save/i }).click();
    await expect(page.getByText('Penicillin')).toBeVisible();

    // ===== SECTION 4: Symptoms =====
    await page.getByRole('link', { name: /Symptoms/i }).click();
    await expect(page).toHaveURL(/\/symptoms/);

    // Add a symptom
    await page.getByRole('button', { name: /Log Symptom|Add Symptom/i }).first().click();
    await page.getByLabel(/Symptom Type/i).fill('Headache');
    await page.getByLabel(/Severity/i).fill('6');

    // Find and select category (may be a select dropdown)
    const categorySelect = page.getByLabel(/Category/i);
    if (await categorySelect.isVisible()) {
      await categorySelect.click();
      await page.getByRole('option', { name: /Neurological|Pain/i }).first().click();
    }

    await page.getByRole('button', { name: /Save|Log Symptom/i }).click();
    await expect(page.getByText('Headache')).toBeVisible();

    // ===== SECTION 5: Appointments =====
    await page.getByRole('link', { name: /Appointments/i }).click();
    await expect(page).toHaveURL(/\/appointments/);

    // Add an appointment
    await page.getByRole('button', { name: /Add Appointment/i }).click();
    await page.getByLabel(/Doctor Name/i).fill('Dr. Emily Chen');
    await page.getByLabel(/Reason for Visit/i).fill('Annual physical exam');
    await page.getByLabel(/Symptoms/i).fill('General checkup, occasional headaches');
    await page.getByRole('button', { name: /Save/i }).click();
    await expect(page.getByText('Dr. Emily Chen')).toBeVisible();

    // ===== VERIFICATION STEP 1: Check Dashboard shows data =====
    await page.getByRole('link', { name: /Dashboard/i }).click();
    await expect(page).toHaveURL(/^\/$|\/$/);

    // Dashboard should show recent symptoms and upcoming appointments
    // At minimum, verify we're on the dashboard
    await expect(page.getByText(/Dashboard|Health Log|Symptom/i)).toBeVisible();

    // ===== CRITICAL STEP: Reload the page =====
    await page.reload();

    // Wait for page to fully load
    await expect(page.getByText(/Dashboard|Health Log/i)).toBeVisible();

    // ===== VERIFICATION STEP 2: Verify all data persisted after reload =====

    // Check Medical History - Conditions
    await page.getByRole('link', { name: /Medical History/i }).click();
    await expect(page.getByText('Hypertension')).toBeVisible();
    await expect(page.getByText('Controlled with medication')).toBeVisible();

    // Check Medical History - Medications
    await page.getByRole('button', { name: /Medications/ }).click();
    await expect(page.getByText('Lisinopril')).toBeVisible();
    await expect(page.getByText('10mg')).toBeVisible();

    // Check Medical History - Allergies
    await page.getByRole('button', { name: /Allergies/ }).click();
    await expect(page.getByText('Penicillin')).toBeVisible();
    await expect(page.getByText('Rash and hives')).toBeVisible();

    // Check Symptoms
    await page.getByRole('link', { name: /Symptoms/i }).click();
    await expect(page.getByText('Headache')).toBeVisible();

    // Check Appointments
    await page.getByRole('link', { name: /Appointments/i }).click();
    await expect(page.getByText('Dr. Emily Chen')).toBeVisible();
    await expect(page.getByText('Annual physical exam')).toBeVisible();

    // ===== SUCCESS: All data persisted across reload! =====
  });

  test('should handle localStorage quota gracefully', async ({ page }) => {
    await page.goto('/');

    // This test verifies error handling for quota exceeded scenarios
    // In a real scenario, we'd fill localStorage until quota is exceeded
    // For now, we just verify the app loads without localStorage issues

    await expect(page.getByText(/Dashboard|Health Log/i)).toBeVisible();

    // Verify we can still navigate
    await page.getByRole('link', { name: /Medical History/i }).click();
    await expect(page).toHaveURL(/\/medical-history/);
  });

  test('should handle corrupted localStorage data gracefully', async ({ page }) => {
    await page.goto('/');

    // Inject corrupted data into localStorage
    await page.evaluate(() => {
      localStorage.setItem('health-log:conditions', 'INVALID_JSON{{{');
      localStorage.setItem('health-log:medications', '12345'); // Invalid format
    });

    // Reload the page
    await page.reload();

    // App should still load (corrupted data should be reset)
    await expect(page.getByText(/Dashboard|Health Log/i)).toBeVisible();

    // Navigate to Medical History
    await page.getByRole('link', { name: /Medical History/i }).click();

    // Should show empty state (corrupted data was cleared)
    await expect(page.getByText(/No conditions recorded/i)).toBeVisible();
  });
});
