# RevealSecretCard Display Issues Bugfix Design

## Overview

The `RevealSecretCard` component has two critical display issues that prevent it from functioning correctly:

1. **Client Secret Not Displaying**: The client secret value is not being shown in the dialog even though it's passed as a prop
2. **Unwanted DialogFooter Styling**: The dialog footer has unnecessary background color (`bg-muted/50`) and border-top styling that doesn't match the design intent

**Impact**: Users cannot see their client secret after creation or regeneration, which is critical for OAuth/OIDC setup. The footer styling also creates visual inconsistency.

**Fix Strategy**: 
1. Investigate why `clientSecret` prop is not rendering despite being passed
2. Remove or override the default DialogFooter background and border styling to achieve a clean, minimal appearance

## Glossary

- **Bug_Condition (C)**: The condition that triggers the display bugs - when RevealSecretCard dialog opens with a clientSecret value
- **Property (P)**: The desired behavior - client secret should be visible and footer should have minimal styling
- **Preservation**: Existing dialog behavior for Client ID display, copy functionality, and dismissal must remain unchanged
- **RevealSecretCard**: The dialog component in `/apps/auth-web/features/dashboard/components/clients/reveal-secret-card.tsx` that displays OAuth client credentials after creation or secret regeneration
- **DialogFooter**: The UI component from `/apps/auth-web/components/ui/dialog.tsx` that provides footer layout with default styling
- **clientSecret**: The sensitive credential value passed from parent component via props that should be displayed once to the user

## Bug Details

### Bug Condition

The bugs manifest when a user creates a new OAuth client or regenerates an existing client's secret. The `RevealSecretCard` dialog opens to display the credentials, but:

1. The Client ID displays correctly
2. The Client Secret section either doesn't render at all, or renders but shows no value
3. The DialogFooter displays with a gray background (`bg-muted/50`) and top border, creating visual inconsistency

**Formal Specification:**
```
FUNCTION isBugCondition(props)
  INPUT: props of type RevealSecretCardProps
  OUTPUT: boolean
  
  RETURN props.clientSecret IS NOT NULL
         AND props.clientSecret IS NOT UNDEFINED
         AND props.clientSecret.length > 0
         AND dialogIsOpen = true
END FUNCTION
```

### Examples

**Bug Scenario 1 - After Client Creation:**
- User registers a new OAuth client via "Register Client" button
- Backend returns `{ clientId: "abc123", clientSecret: "secret_xyz789", name: "My App" }`
- Parent component stores this in `newClientSecret` state
- RevealSecretCard is rendered with `clientSecret="secret_xyz789"`
- **Expected**: Client Secret displays as "secret_xyz789" with amber styling
- **Actual**: Client Secret section may not appear, or appears but shows nothing

**Bug Scenario 2 - After Secret Regeneration:**
- User clicks "Regenerate Secret" on existing client
- API returns new secret: `{ clientId: "abc123", clientSecret: "secret_new456", name: "My App" }`
- RevealSecretCard opens with new secret
- **Expected**: New client secret displays
- **Actual**: Client secret not visible

**Bug Scenario 3 - Footer Styling:**
- RevealSecretCard dialog opens (any scenario)
- **Expected**: Clean footer with just a close button, minimal styling
- **Actual**: Footer has gray background and border-top, creating visual disconnect from dialog body

**Edge Case - No Secret Provided:**
- If `clientSecret` is undefined/null (intentionally), the Client Secret section should not render at all
- **Expected behavior**: Only Client ID section shows, no Client Secret section
- This is working correctly and should be preserved

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Client ID display must continue to work exactly as before (shows value, copy button works)
- Copy to clipboard functionality for both Client ID and Client Secret must remain unchanged
- Dialog open/close behavior must remain unchanged
- Dialog dismiss on background click or close button must continue to work
- Warning message and shield icon styling must remain unchanged
- The conditional rendering logic (showing Client Secret section only when `clientSecret` exists) must be preserved

**Scope:**
All aspects of the RevealSecretCard component that do NOT involve:
1. The rendering/display of the `clientSecret` value itself
2. The DialogFooter background and border styling

Should be completely unaffected by this fix. This includes:
- Dialog header with warning icon
- Dialog description text
- Client ID display section
- Copy button interactions and visual feedback
- Dialog animation and transitions
- Close button functionality

## Hypothesized Root Cause

Based on the bug description and code analysis, the most likely issues are:

### Issue 1: Client Secret Not Displaying

**Most Likely Causes:**

1. **Prop Value Issue**: The `clientSecret` prop might be receiving an unexpected value format
   - Could be wrapped in an object instead of a plain string
   - Could have whitespace that makes it appear empty
   - Could be a type mismatch (e.g., receiving undefined when it should be omitted)

2. **Conditional Rendering Logic**: The `{clientSecret && (...)}` check might be failing
   - The condition might be evaluating to falsy even when a value exists
   - There could be an issue with how the condition is written

3. **CSS/Display Issue**: The element might be rendering but not visible
   - Could have display: none from a parent
   - Could be positioned off-screen
   - Could have opacity: 0 or visibility: hidden

4. **State Timing Issue**: The prop might not be set when the dialog first opens
   - The dialog could open before `clientSecret` is populated
   - There could be a race condition in the parent component

### Issue 2: DialogFooter Styling

**Root Cause (Confirmed):**

The DialogFooter component in `/apps/auth-web/components/ui/dialog.tsx` has default styling:
```tsx
className={cn(
  "bg-muted/50 -mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t p-4 sm:flex-row sm:justify-end",
  className,
)}
```

The `bg-muted/50` and `border-t` classes are causing the unwanted background and border. The RevealSecretCard is using:
```tsx
<DialogFooter showCloseButton={true} />
```

Without passing a custom className to override these defaults.

## Correctness Properties

Property 1: Bug Condition - Client Secret Visibility

_For any_ RevealSecretCard dialog instance where the `clientSecret` prop is provided (non-null, non-undefined, non-empty string), the fixed component SHALL render the Client Secret section with the secret value displayed in amber-colored, monospace text, and the copy button SHALL be functional.

**Validates: Requirements 2.1, 2.2**

Property 2: Bug Condition - DialogFooter Minimal Styling

_For any_ RevealSecretCard dialog instance, the fixed DialogFooter SHALL render without background color and without a top border, maintaining only the close button and necessary spacing/layout, creating a clean visual appearance consistent with the dialog body.

**Validates: Requirements 2.3**

Property 3: Preservation - Client ID Display

_For any_ RevealSecretCard dialog instance (with or without clientSecret), the fixed component SHALL display the Client ID exactly as before, including the label, value display, and copy button functionality, producing identical behavior to the original component.

**Validates: Requirements 3.1, 3.2**

Property 4: Preservation - Dialog Behavior

_For any_ user interaction with the RevealSecretCard dialog (opening, closing, background click, copy actions), the fixed component SHALL produce the same behavior as the original component, preserving all dialog state management and event handling.

**Validates: Requirements 3.3, 3.4, 3.5**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `/apps/auth-web/features/dashboard/components/clients/reveal-secret-card.tsx`

**Specific Changes**:

1. **Investigate and Fix Client Secret Display**:
   - Add debug logging to verify `clientSecret` prop value and type
   - Check if conditional rendering logic needs adjustment
   - Verify no CSS is hiding the element
   - Ensure no whitespace or formatting issues with the value
   - If the issue is prop timing, add proper loading/ready state handling

2. **Fix DialogFooter Styling**:
   - Pass a custom `className` prop to `DialogFooter` to override default styling
   - Remove background and border: `className="bg-transparent border-none"`
   - Maintain existing layout classes for proper button positioning
   - Alternative: Modify props to adjust footer appearance if supported

3. **Code Structure**:
   ```tsx
   // Before (DialogFooter with default styling)
   <DialogFooter showCloseButton={true} />
   
   // After (DialogFooter with overridden styling)
   <DialogFooter 
     showCloseButton={true} 
     className="bg-transparent border-0 border-none"
   />
   ```

4. **Testing the Client Secret Rendering**:
   - Verify `clientSecret` prop is correctly typed and received
   - Ensure conditional rendering `{clientSecret && (...)}` works as expected
   - Check for any React rendering issues (key props, fragments, etc.)

5. **Remove Unused Import** (Minor):
   - Remove `import * as React from "react";` as it's not being used (shown in diagnostic)

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bugs on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bugs BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: 
1. Manually test the component by creating a new OAuth client and observing if the client secret appears
2. Inspect the component in browser DevTools to check:
   - Is the Client Secret section rendering in the DOM?
   - What is the actual prop value being received?
   - Are there any CSS rules hiding it?
3. Add console.log statements to log the `clientSecret` prop value
4. Check the DialogFooter styling in DevTools to confirm background and border are present

**Test Cases**:
1. **New Client Creation Test**: Create a new OAuth client, observe RevealSecretCard dialog (will fail on unfixed code - secret not visible)
2. **Secret Regeneration Test**: Regenerate an existing client's secret, observe dialog (will fail on unfixed code - secret not visible)
3. **Footer Styling Inspection**: Open RevealSecretCard dialog, inspect DialogFooter element in DevTools (will show bg-muted/50 and border-t on unfixed code)
4. **Client ID Display Test**: Verify Client ID displays correctly (should pass on unfixed code - this is working)

**Expected Counterexamples**:
- Client Secret section either doesn't appear in DOM, or appears but has no text content
- DialogFooter element has computed background-color and border-top-width > 0
- Possible causes for secret not showing: prop value issue, conditional rendering failure, CSS visibility issue, or timing/state issue

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL props WHERE isBugCondition(props) DO
  component := RevealSecretCard_fixed(props)
  
  // Check Client Secret Display
  ASSERT component.contains(<clientSecretSection>)
  ASSERT component.clientSecretSection.textContent = props.clientSecret
  ASSERT component.clientSecretSection.hasClass("text-amber-600") OR hasClass("dark:text-amber-400")
  ASSERT component.clientSecretSection.copyButton.isClickable
  
  // Check DialogFooter Styling
  ASSERT component.dialogFooter.backgroundColor = "transparent" OR "inherit"
  ASSERT component.dialogFooter.borderTopWidth = 0
  ASSERT component.dialogFooter.closeButton.isVisible
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold (or for all behaviors unrelated to the bug), the fixed component produces the same result as the original component.

**Pseudocode:**
```
FOR ALL props WHERE NOT isBugCondition(props) DO
  ASSERT RevealSecretCard_original(props).clientIdDisplay = RevealSecretCard_fixed(props).clientIdDisplay
  ASSERT RevealSecretCard_original(props).dialogBehavior = RevealSecretCard_fixed(props).dialogBehavior
END FOR

FOR ALL userInteractions IN [copyClientId, copyClientSecret, closeDialog, clickBackground] DO
  ASSERT RevealSecretCard_original.handle(userInteraction) = RevealSecretCard_fixed.handle(userInteraction)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: 
1. First, observe behavior on UNFIXED code for Client ID copy, dialog dismiss, and all preserved behaviors
2. Document the exact behavior (timing of copy feedback, dialog animation, state updates)
3. Write property-based tests that generate various prop combinations and verify preserved behaviors match

**Test Cases**:
1. **Client ID Copy Preservation**: Verify clicking copy button for Client ID updates clipboard and shows checkmark feedback (2 second duration)
2. **Dialog Dismiss Preservation**: Verify clicking X button or background calls `onDismiss` callback
3. **Copy Feedback Preservation**: Verify `copiedId` state management works identically for both "reveal-id" and "reveal-secret" 
4. **Conditional Rendering Preservation**: Verify when `clientSecret` is null/undefined, the Client Secret section does NOT render (edge case that should keep working)
5. **Dialog Animation Preservation**: Verify dialog open/close animations are unchanged
6. **Warning Styling Preservation**: Verify shield icon, amber colors, and warning text remain identical

### Unit Tests

- Test that clientSecret prop value is correctly rendered in the DOM
- Test that DialogFooter receives correct className override
- Test copy button functionality for both Client ID and Client Secret
- Test dialog dismiss via `onDismiss` callback
- Test conditional rendering: clientSecret present vs absent
- Test that unused React import is removed (linting test)

### Property-Based Tests

- Generate random clientId/clientSecret string combinations and verify both display correctly
- Generate random timing scenarios for copy button clicks and verify feedback state management
- Generate random dialog open/close sequences and verify state consistency
- Test edge cases: empty strings, very long strings, special characters in secrets

### Integration Tests

- Full flow: Create new OAuth client → RevealSecretCard opens → Verify secret visible → Copy secret → Verify clipboard → Close dialog
- Full flow: Regenerate secret → RevealSecretCard opens → Verify new secret visible → Verify old behavior preserved
- Visual regression: Compare screenshots of fixed DialogFooter vs design mockups to ensure no background/border
- Cross-browser: Test dialog rendering in Chrome, Firefox, Safari to ensure styling works consistently
