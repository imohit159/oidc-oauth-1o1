# Bugfix Requirements Document

## Introduction

The `RevealSecretCard` component exhibits two critical display defects that prevent users from viewing their OAuth client credentials and create visual inconsistency in the dialog interface. After creating or regenerating an OAuth client, users rely on this dialog to copy their credentials for application configuration. The current implementation fails to display the client secret value despite receiving it as a prop, and applies unintended styling to the dialog footer that conflicts with the design intent.

**Bug Impact:**
- Users cannot see their client secret after creation or regeneration, blocking OAuth/OIDC setup workflows
- Visual inconsistency in the dialog footer creates a poor user experience
- Users may believe the secret was not generated, leading to confusion and support requests

**Component Location:** `/apps/auth-web/features/dashboard/components/clients/reveal-secret-card.tsx`

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the RevealSecretCard dialog opens after creating a new OAuth client with a valid clientSecret prop value THEN the system fails to display the client secret value in the dialog

1.2 WHEN the RevealSecretCard dialog opens after regenerating an existing client's secret with a valid clientSecret prop value THEN the system fails to display the regenerated client secret value in the dialog

1.3 WHEN the RevealSecretCard dialog opens with any valid clientSecret prop value THEN the DialogFooter renders with unwanted background color (bg-muted/50) and border-top styling

1.4 WHEN inspecting the DOM during a RevealSecretCard dialog display with a clientSecret prop THEN the Client Secret section either does not render at all or renders but contains no visible text content

### Expected Behavior (Correct)

2.1 WHEN the RevealSecretCard dialog opens after creating a new OAuth client with a valid clientSecret prop value THEN the system SHALL display the client secret value in amber-colored monospace text within the Client Secret section

2.2 WHEN the RevealSecretCard dialog opens after regenerating an existing client's secret with a valid clientSecret prop value THEN the system SHALL display the regenerated client secret value in amber-colored monospace text within the Client Secret section

2.3 WHEN the RevealSecretCard dialog opens THEN the DialogFooter SHALL render with transparent background and no top border, maintaining only the close button and necessary layout spacing

2.4 WHEN a user views the RevealSecretCard dialog with a valid clientSecret prop THEN the Client Secret section SHALL render with a copy button that is clickable and provides visual feedback when activated

2.5 WHEN the clientSecret prop is null, undefined, or an empty string THEN the system SHALL NOT render the Client Secret section at all

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the RevealSecretCard dialog opens with a valid clientId prop THEN the system SHALL CONTINUE TO display the Client ID value exactly as before with proper formatting and copy button functionality

3.2 WHEN a user clicks the copy button for the Client ID THEN the system SHALL CONTINUE TO copy the value to clipboard and display checkmark feedback for the same duration as before

3.3 WHEN a user clicks the close button or clicks outside the RevealSecretCard dialog THEN the system SHALL CONTINUE TO trigger the onDismiss callback and close the dialog with the same behavior as before

3.4 WHEN a user clicks the copy button for the Client Secret (after the fix) THEN the system SHALL CONTINUE TO copy the secret to clipboard and display checkmark feedback with the same copiedId state management as the Client ID copy functionality

3.5 WHEN the RevealSecretCard dialog opens THEN the system SHALL CONTINUE TO display the warning header with shield icon, amber styling, and security message exactly as before

3.6 WHEN the RevealSecretCard dialog renders THEN the system SHALL CONTINUE TO apply the same dialog animations, transitions, and layout structure as before

3.7 WHEN the clientSecret prop transitions from undefined to a valid value THEN the system SHALL CONTINUE TO apply the same conditional rendering logic for the Client Secret section without affecting other dialog sections
