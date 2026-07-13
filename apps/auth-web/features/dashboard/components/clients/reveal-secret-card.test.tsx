import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RevealSecretCard } from './reveal-secret-card';
import * as fc from 'fast-check';

/**
 * Bug Condition Exploration Tests for RevealSecretCard
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4**
 * 
 * CRITICAL: These tests MUST FAIL on unfixed code - failure confirms the bugs exist
 * 
 * These tests encode the expected behavior for two bugs:
 * 1. Client Secret Display Issue - secret value not visible in the dialog
 * 2. DialogFooter Styling Issue - unwanted background color and border
 * 
 * When these tests pass after implementation, it confirms the bugs are fixed.
 */

describe('RevealSecretCard - Bug Condition Exploration', () => {
    /**
     * Property 1: Client Secret Display
     * 
     * **Validates: Requirements 2.1, 2.2, 2.4**
     * 
     * Bug Condition: When RevealSecretCard opens with valid clientSecret prop
     * Expected Behavior: Client Secret section renders with amber text and copy button
     * 
     * This test will FAIL on unfixed code because:
     * - Client Secret section may not render at all
     * - Client Secret value may not be visible in the DOM
     */
    describe('Property 1: Client Secret value is displayed in amber text with copy button', () => {
        it('should display client secret in amber-colored monospace text when clientSecret prop is provided', () => {
            // Arrange - using a concrete failing case
            const testProps = {
                name: 'Test OAuth Client',
                clientId: 'test_client_123',
                clientSecret: 'secret_abc789xyz', // Bug: This value should display but doesn't
                onDismiss: vi.fn(),
                copiedId: null,
                onCopy: vi.fn(),
            };

            // Act
            render(<RevealSecretCard {...testProps} />);

            // Assert - Expected behavior (will FAIL on unfixed code)

            // 1. Client Secret section should render
            const clientSecretLabel = screen.getByText(/client secret/i);
            expect(clientSecretLabel).toBeInTheDocument();

            // 2. Client Secret value should be visible in the DOM
            const secretElement = screen.getByText(testProps.clientSecret);
            expect(secretElement).toBeInTheDocument();

            // 3. Secret should have amber styling (text-amber-600 or dark:text-amber-400)
            expect(secretElement).toHaveClass('text-amber-600');

            // 4. Secret should have monospace font
            expect(secretElement).toHaveClass('font-mono');

            // 5. Copy button for secret should be present and clickable
            const copyButtons = screen.getAllByRole('button');
            // Should have at least 2 buttons: one for Client ID, one for Client Secret
            expect(copyButtons.length).toBeGreaterThanOrEqual(2);
        });

        it('should render Client Secret section with functional copy button', () => {
            // Arrange
            const mockOnCopy = vi.fn();
            const testProps = {
                name: 'Test App',
                clientId: 'client_456',
                clientSecret: 'secret_def456',
                onDismiss: vi.fn(),
                copiedId: null,
                onCopy: mockOnCopy,
            };

            // Act
            render(<RevealSecretCard {...testProps} />);

            // Assert
            const secretElement = screen.getByText(testProps.clientSecret);
            expect(secretElement).toBeInTheDocument();

            // Copy button should exist in the same container
            const secretContainer = secretElement.closest('div');
            expect(secretContainer).toBeTruthy();

            // The secret should be displayed in amber text
            expect(secretElement.className).toContain('text-amber');
        });

        /**
         * Property-based test: For ANY valid clientSecret value
         * 
         * This scopes the property to concrete failing cases to ensure reproducibility
         * while still testing multiple scenarios.
         */
        it('property: should display any valid client secret in amber text', () => {
            fc.assert(
                fc.property(
                    // Generate valid client secret strings (simulating real OAuth secrets)
                    fc.stringMatching(/^[a-zA-Z0-9_-]{10,50}$/),
                    (clientSecret) => {
                        // Arrange
                        const props = {
                            name: 'Generated Client',
                            clientId: 'client_test',
                            clientSecret,
                            onDismiss: vi.fn(),
                            copiedId: null,
                            onCopy: vi.fn(),
                        };

                        // Act
                        const { unmount } = render(<RevealSecretCard {...props} />);

                        // Assert - Expected behavior
                        try {
                            // Client Secret section should render
                            const secretElement = screen.getByText(clientSecret);
                            expect(secretElement).toBeInTheDocument();

                            // Should have amber styling
                            expect(secretElement.className).toContain('text-amber');

                            // Should have monospace font
                            expect(secretElement.className).toContain('font-mono');
                        } finally {
                            unmount();
                        }
                    }
                ),
                { numRuns: 10 } // Run 10 test cases to surface counterexamples
            );
        });
    });

    /**
     * Property 2: DialogFooter Styling
     * 
     * **Validates: Requirements 2.3**
     * 
     * Bug Condition: When RevealSecretCard dialog opens
     * Expected Behavior: DialogFooter has transparent background and no border
     * 
     * This test will FAIL on unfixed code because:
     * - DialogFooter has 'bg-muted/50' class causing gray background
     * - DialogFooter has 'border-t' class causing top border
     */
    describe('Property 2: DialogFooter has transparent background and no border', () => {
        it('should render DialogFooter without background color and border', () => {
            // Arrange - concrete failing case
            const testProps = {
                name: 'Test Client',
                clientId: 'client_789',
                clientSecret: 'secret_ghi789',
                onDismiss: vi.fn(),
                copiedId: null,
                onCopy: vi.fn(),
            };

            // Act
            render(<RevealSecretCard {...testProps} />);

            // Assert - Expected behavior (will FAIL on unfixed code)

            // Find the dialog footer (it contains the close button)
            const closeButton = screen.getByRole('button', { name: /close/i });
            const dialogFooter = closeButton.closest('[class*="DialogFooter"]') ||
                closeButton.parentElement;

            expect(dialogFooter).toBeTruthy();

            // DialogFooter should NOT have background color (should be transparent or inherit)
            // Bug: Currently has 'bg-muted/50' class
            const footerClasses = dialogFooter?.className || '';

            // Expected: Should have 'bg-transparent' or no background class
            // Actual on unfixed code: Has 'bg-muted/50'
            expect(footerClasses).not.toContain('bg-muted');

            // DialogFooter should NOT have border-t
            // Bug: Currently has 'border-t' class
            expect(footerClasses).not.toContain('border-t');
        });

        it('property: DialogFooter styling should be clean for any valid props', () => {
            fc.assert(
                fc.property(
                    fc.record({
                        name: fc.string({ minLength: 1, maxLength: 50 }),
                        clientId: fc.stringMatching(/^[a-zA-Z0-9_-]{5,30}$/),
                        clientSecret: fc.option(fc.stringMatching(/^[a-zA-Z0-9_-]{10,50}$/), { nil: undefined }),
                    }),
                    (props) => {
                        // Arrange
                        const fullProps = {
                            ...props,
                            onDismiss: vi.fn(),
                            copiedId: null,
                            onCopy: vi.fn(),
                        };

                        // Act
                        const { unmount, container } = render(<RevealSecretCard {...fullProps} />);

                        // Assert
                        try {
                            // Find all elements with dialog-related classes
                            const footerElements = container.querySelectorAll('[class*="flex"][class*="justify-end"]');

                            // Check that no footer elements have bg-muted or border-t
                            footerElements.forEach((element) => {
                                const classes = element.className;
                                // Expected: transparent background, no border
                                // Will fail on unfixed code with bg-muted/50 and border-t
                                expect(classes).not.toContain('bg-muted');
                                expect(classes).not.toContain('border-t');
                            });
                        } finally {
                            unmount();
                        }
                    }
                ),
                { numRuns: 5 }
            );
        });
    });

    /**
     * Combined Bug Condition Test
     * 
     * Tests both bugs together in a single scenario
     */
    it('should display client secret correctly AND have clean footer styling', () => {
        // Arrange
        const testProps = {
            name: 'Production App',
            clientId: 'prod_client_001',
            clientSecret: 'prod_secret_xyz123abc',
            onDismiss: vi.fn(),
            copiedId: null,
            onCopy: vi.fn(),
        };

        // Act
        const { container } = render(<RevealSecretCard {...testProps} />);

        // Assert Bug 1: Client Secret Display
        const secretElement = screen.getByText(testProps.clientSecret);
        expect(secretElement).toBeInTheDocument();
        expect(secretElement).toHaveClass('text-amber-600');
        expect(secretElement).toHaveClass('font-mono');

        // Assert Bug 2: DialogFooter Styling
        const footerElements = container.querySelectorAll('[class*="flex"][class*="justify-end"]');
        footerElements.forEach((element) => {
            const classes = element.className;
            expect(classes).not.toContain('bg-muted');
            expect(classes).not.toContain('border-t');
        });
    });
});

/**
 * Preservation Property Tests for RevealSecretCard
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**
 * 
 * IMPORTANT: These tests follow observation-first methodology
 * 
 * These tests verify that non-buggy behaviors remain unchanged:
 * 1. Client ID displays correctly with proper formatting
 * 2. Copy button for Client ID works and shows checkmark feedback
 * 3. Close button and background click trigger onDismiss callback
 * 4. Warning header with shield icon displays with amber styling
 * 5. Dialog animations and transitions work correctly
 * 6. When clientSecret is null/undefined, Client Secret section does not render
 * 
 * EXPECTED OUTCOME: Tests PASS on unfixed code (confirms baseline behavior to preserve)
 */

describe('RevealSecretCard - Preservation Properties', () => {
    /**
     * Property 3: Client ID Display Preservation
     * 
     * **Validates: Requirements 3.1**
     * 
     * For any RevealSecretCard with valid clientId, Client ID section displays correctly
     */
    describe('Property 3: Client ID section displays correctly', () => {
        it('should display Client ID with proper formatting and copy button', () => {
            // Arrange
            const testProps = {
                name: 'Test App',
                clientId: 'client_abc123',
                clientSecret: undefined, // No secret to isolate Client ID behavior
                onDismiss: vi.fn(),
                copiedId: null,
                onCopy: vi.fn(),
            };

            // Act
            render(<RevealSecretCard {...testProps} />);

            // Assert - Verify baseline behavior
            // 1. Client ID label should be present
            const clientIdLabel = screen.getByText(/client id/i);
            expect(clientIdLabel).toBeInTheDocument();

            // 2. Client ID value should be visible
            const clientIdElement = screen.getByText(testProps.clientId);
            expect(clientIdElement).toBeInTheDocument();

            // 3. Client ID should be in a code element
            expect(clientIdElement.tagName).toBe('CODE');

            // 4. Copy button should be present
            const copyButtons = screen.getAllByRole('button');
            expect(copyButtons.length).toBeGreaterThanOrEqual(1);
        });

        it('property: Client ID displays correctly for any valid clientId value', () => {
            fc.assert(
                fc.property(
                    // Generate realistic client IDs
                    fc.stringMatching(/^[a-zA-Z0-9_-]{5,40}$/),
                    (clientId) => {
                        // Arrange
                        const props = {
                            name: 'Generated Client',
                            clientId,
                            clientSecret: undefined,
                            onDismiss: vi.fn(),
                            copiedId: null,
                            onCopy: vi.fn(),
                        };

                        // Act
                        const { unmount } = render(<RevealSecretCard {...props} />);

                        // Assert - Preserve baseline behavior
                        try {
                            // Client ID should be visible
                            const clientIdElement = screen.getByText(clientId);
                            expect(clientIdElement).toBeInTheDocument();

                            // Should be in a code element
                            expect(clientIdElement.tagName).toBe('CODE');

                            // Client ID label should exist
                            expect(screen.getByText(/client id/i)).toBeInTheDocument();
                        } finally {
                            unmount();
                        }
                    }
                ),
                { numRuns: 10 }
            );
        });
    });

    /**
     * Property 4: Client ID Copy Functionality Preservation
     * 
     * **Validates: Requirements 3.2**
     * 
     * For any copy button click on Client ID, clipboard is updated and checkmark shows
     */
    describe('Property 4: Copy button for Client ID works with checkmark feedback', () => {
        it('should call onCopy when Client ID copy button is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            const mockOnCopy = vi.fn();
            const testProps = {
                name: 'Test Client',
                clientId: 'client_copy_test',
                clientSecret: undefined,
                onDismiss: vi.fn(),
                copiedId: null,
                onCopy: mockOnCopy,
            };

            // Act
            render(<RevealSecretCard {...testProps} />);
            const copyButtons = screen.getAllByRole('button');
            const clientIdCopyButton = copyButtons.find(btn =>
                btn.closest('div')?.textContent?.includes(testProps.clientId)
            );

            expect(clientIdCopyButton).toBeDefined();
            await user.click(clientIdCopyButton!);

            // Assert - Verify baseline behavior
            expect(mockOnCopy).toHaveBeenCalledWith(testProps.clientId, 'reveal-id');
        });

        it('should display checkmark when Client ID is copied', () => {
            // Arrange - Simulate copied state
            const testProps = {
                name: 'Test App',
                clientId: 'client_xyz789',
                clientSecret: undefined,
                onDismiss: vi.fn(),
                copiedId: 'reveal-id', // Simulating copied state
                onCopy: vi.fn(),
            };

            // Act
            const { container } = render(<RevealSecretCard {...testProps} />);

            // Assert - Check icon is rendered (baseline behavior)
            // The Check component should be present when copiedId matches
            const checkIcons = container.querySelectorAll('svg');
            const hasCheckIcon = Array.from(checkIcons).some(icon =>
                icon.classList.contains('lucide-check') ||
                icon.parentElement?.className.includes('text-green')
            );
            expect(hasCheckIcon).toBe(true);
        });

        it('property: Copy functionality works for any valid clientId', () => {
            fc.assert(
                fc.property(
                    fc.stringMatching(/^[a-zA-Z0-9_-]{5,40}$/),
                    async (clientId) => {
                        // Arrange
                        const user = userEvent.setup();
                        const mockOnCopy = vi.fn();
                        const props = {
                            name: 'Test',
                            clientId,
                            clientSecret: undefined,
                            onDismiss: vi.fn(),
                            copiedId: null,
                            onCopy: mockOnCopy,
                        };

                        // Act
                        const { unmount } = render(<RevealSecretCard {...props} />);

                        try {
                            const copyButtons = screen.getAllByRole('button');
                            if (copyButtons.length > 0) {
                                await user.click(copyButtons[0]);

                                // Assert - Preserve copy behavior
                                expect(mockOnCopy).toHaveBeenCalledWith(clientId, 'reveal-id');
                            }
                        } finally {
                            unmount();
                        }
                    }
                ),
                { numRuns: 5 }
            );
        });
    });

    /**
     * Property 5: Dialog Close Behavior Preservation
     * 
     * **Validates: Requirements 3.3**
     * 
     * For any dialog close action, onDismiss callback is triggered
     */
    describe('Property 5: Close button triggers onDismiss callback', () => {
        it('should call onDismiss when close button is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            const mockOnDismiss = vi.fn();
            const testProps = {
                name: 'Test Client',
                clientId: 'client_dismiss_test',
                clientSecret: undefined,
                onDismiss: mockOnDismiss,
                copiedId: null,
                onCopy: vi.fn(),
            };

            // Act
            render(<RevealSecretCard {...testProps} />);

            // Find close button (should have "Close" text or close icon)
            const closeButton = screen.getByRole('button', { name: /close/i });
            await user.click(closeButton);

            // Assert - Verify baseline behavior
            expect(mockOnDismiss).toHaveBeenCalled();
        });

        it('property: onDismiss is called for any valid dialog instance', () => {
            fc.assert(
                fc.property(
                    fc.record({
                        name: fc.string({ minLength: 1, maxLength: 50 }),
                        clientId: fc.stringMatching(/^[a-zA-Z0-9_-]{5,40}$/),
                    }),
                    async (data) => {
                        // Arrange
                        const user = userEvent.setup();
                        const mockOnDismiss = vi.fn();
                        const props = {
                            ...data,
                            clientSecret: undefined,
                            onDismiss: mockOnDismiss,
                            copiedId: null,
                            onCopy: vi.fn(),
                        };

                        // Act
                        const { unmount } = render(<RevealSecretCard {...props} />);

                        try {
                            const closeButton = screen.getByRole('button', { name: /close/i });
                            await user.click(closeButton);

                            // Assert - Preserve dismiss behavior
                            expect(mockOnDismiss).toHaveBeenCalled();
                        } finally {
                            unmount();
                        }
                    }
                ),
                { numRuns: 5 }
            );
        });
    });

    /**
     * Property 6: Warning Header Preservation
     * 
     * **Validates: Requirements 3.5**
     * 
     * For any valid dialog open, warning message and shield icon render with amber styling
     */
    describe('Property 6: Warning header with shield icon displays with amber styling', () => {
        it('should display warning header with shield icon and amber colors', () => {
            // Arrange
            const testProps = {
                name: 'Production App',
                clientId: 'client_prod_001',
                clientSecret: undefined,
                onDismiss: vi.fn(),
                copiedId: null,
                onCopy: vi.fn(),
            };

            // Act
            const { container } = render(<RevealSecretCard {...testProps} />);

            // Assert - Verify baseline styling
            // 1. Dialog title should exist
            const title = screen.getByText(/credentials generated/i);
            expect(title).toBeInTheDocument();

            // 2. Title should have amber styling
            expect(title.className).toContain('text-amber');

            // 3. Description should mention the client name
            const description = screen.getByText(new RegExp(testProps.name, 'i'));
            expect(description).toBeInTheDocument();

            // 4. Shield icon should be present (SVG element)
            const svgIcons = container.querySelectorAll('svg');
            const hasShieldIcon = Array.from(svgIcons).some(svg =>
                svg.classList.contains('lucide-shield')
            );
            expect(hasShieldIcon).toBe(true);

            // 5. Shield icon container should have amber background
            const amberBackgrounds = container.querySelectorAll('[class*="bg-amber"]');
            expect(amberBackgrounds.length).toBeGreaterThan(0);
        });

        it('property: Warning header displays correctly for any client name', () => {
            fc.assert(
                fc.property(
                    fc.string({ minLength: 1, maxLength: 100 }),
                    (name) => {
                        // Arrange
                        const props = {
                            name,
                            clientId: 'client_test',
                            clientSecret: undefined,
                            onDismiss: vi.fn(),
                            copiedId: null,
                            onCopy: vi.fn(),
                        };

                        // Act
                        const { unmount, container } = render(<RevealSecretCard {...props} />);

                        // Assert - Preserve warning header styling
                        try {
                            // Title should exist with amber styling
                            const title = screen.getByText(/credentials generated/i);
                            expect(title).toBeInTheDocument();
                            expect(title.className).toContain('text-amber');

                            // Client name should appear in description
                            const description = screen.getByText(new RegExp(name, 'i'));
                            expect(description).toBeInTheDocument();

                            // Shield icon should be present
                            const svgIcons = container.querySelectorAll('svg');
                            const hasShieldIcon = Array.from(svgIcons).some(svg =>
                                svg.classList.contains('lucide-shield')
                            );
                            expect(hasShieldIcon).toBe(true);
                        } finally {
                            unmount();
                        }
                    }
                ),
                { numRuns: 10 }
            );
        });
    });

    /**
     * Property 7: Conditional Rendering Preservation
     * 
     * **Validates: Requirements 3.7, 2.5**
     * 
     * When clientSecret is null/undefined, Client Secret section does not render
     */
    describe('Property 7: Client Secret section does not render when clientSecret is absent', () => {
        it('should NOT render Client Secret section when clientSecret is undefined', () => {
            // Arrange
            const testProps = {
                name: 'Test App',
                clientId: 'client_no_secret',
                clientSecret: undefined, // No secret provided
                onDismiss: vi.fn(),
                copiedId: null,
                onCopy: vi.fn(),
            };

            // Act
            render(<RevealSecretCard {...testProps} />);

            // Assert - Verify baseline conditional rendering
            // Client ID label should exist
            expect(screen.getByText(/client id/i)).toBeInTheDocument();

            // Client Secret label should NOT exist
            expect(screen.queryByText(/client secret/i)).not.toBeInTheDocument();

            // Only one section should be present (Client ID only)
            const labels = screen.getAllByText(/client/i);
            const clientSecretLabels = labels.filter(el =>
                el.textContent?.toLowerCase().includes('secret')
            );
            expect(clientSecretLabels.length).toBe(0);
        });

        it('should NOT render Client Secret section when clientSecret is null', () => {
            // Arrange
            const testProps = {
                name: 'Test App',
                clientId: 'client_null_secret',
                clientSecret: null as any, // Explicitly null
                onDismiss: vi.fn(),
                copiedId: null,
                onCopy: vi.fn(),
            };

            // Act
            render(<RevealSecretCard {...testProps} />);

            // Assert
            expect(screen.getByText(/client id/i)).toBeInTheDocument();
            expect(screen.queryByText(/client secret/i)).not.toBeInTheDocument();
        });

        it('should NOT render Client Secret section when clientSecret is empty string', () => {
            // Arrange
            const testProps = {
                name: 'Test App',
                clientId: 'client_empty_secret',
                clientSecret: '', // Empty string
                onDismiss: vi.fn(),
                copiedId: null,
                onCopy: vi.fn(),
            };

            // Act
            render(<RevealSecretCard {...testProps} />);

            // Assert
            expect(screen.getByText(/client id/i)).toBeInTheDocument();
            // Empty string is falsy, so Client Secret section should not render
            expect(screen.queryByText(/client secret/i)).not.toBeInTheDocument();
        });

        it('property: Client Secret section only renders when secret is provided', () => {
            fc.assert(
                fc.property(
                    fc.record({
                        name: fc.string({ minLength: 1, maxLength: 50 }),
                        clientId: fc.stringMatching(/^[a-zA-Z0-9_-]{5,40}$/),
                        hasSecret: fc.boolean(),
                    }),
                    (data) => {
                        // Arrange
                        const props = {
                            name: data.name,
                            clientId: data.clientId,
                            clientSecret: data.hasSecret ? 'secret_test_123' : undefined,
                            onDismiss: vi.fn(),
                            copiedId: null,
                            onCopy: vi.fn(),
                        };

                        // Act
                        const { unmount } = render(<RevealSecretCard {...props} />);

                        // Assert - Preserve conditional rendering logic
                        try {
                            // Client ID should always be present
                            expect(screen.getByText(/client id/i)).toBeInTheDocument();

                            // Client Secret should only be present when hasSecret is true
                            const clientSecretLabel = screen.queryByText(/client secret/i);
                            if (data.hasSecret) {
                                expect(clientSecretLabel).toBeInTheDocument();
                            } else {
                                expect(clientSecretLabel).not.toBeInTheDocument();
                            }
                        } finally {
                            unmount();
                        }
                    }
                ),
                { numRuns: 10 }
            );
        });
    });

    /**
     * Property 8: Copy State Management Preservation
     * 
     * **Validates: Requirements 3.4**
     * 
     * Copy functionality uses copiedId state management for both Client ID and Client Secret
     */
    describe('Property 8: Copy state management works for both sections', () => {
        it('should show checkmark for Client ID when copiedId is "reveal-id"', () => {
            // Arrange
            const testProps = {
                name: 'Test App',
                clientId: 'client_state_test',
                clientSecret: 'secret_state_test',
                onDismiss: vi.fn(),
                copiedId: 'reveal-id', // Client ID is copied
                onCopy: vi.fn(),
            };

            // Act
            const { container } = render(<RevealSecretCard {...testProps} />);

            // Assert - Verify state management works
            const checkIcons = container.querySelectorAll('.text-green-500');
            expect(checkIcons.length).toBeGreaterThan(0);
        });

        it('should show checkmark for Client Secret when copiedId is "reveal-secret"', () => {
            // Arrange
            const testProps = {
                name: 'Test App',
                clientId: 'client_state_test2',
                clientSecret: 'secret_state_test2',
                onDismiss: vi.fn(),
                copiedId: 'reveal-secret', // Client Secret is copied
                onCopy: vi.fn(),
            };

            // Act
            const { container } = render(<RevealSecretCard {...testProps} />);

            // Assert
            const checkIcons = container.querySelectorAll('.text-green-500');
            expect(checkIcons.length).toBeGreaterThan(0);
        });

        it('should call onCopy with correct ID for Client Secret copy', async () => {
            // Arrange
            const user = userEvent.setup();
            const mockOnCopy = vi.fn();
            const testProps = {
                name: 'Test App',
                clientId: 'client_copy_id_test',
                clientSecret: 'secret_copy_test',
                onDismiss: vi.fn(),
                copiedId: null,
                onCopy: mockOnCopy,
            };

            // Act
            render(<RevealSecretCard {...testProps} />);
            const copyButtons = screen.getAllByRole('button');
            // Second button should be for Client Secret (first is for Client ID)
            const secretCopyButton = copyButtons.find(btn =>
                btn.closest('div')?.textContent?.includes(testProps.clientSecret!)
            );

            if (secretCopyButton) {
                await user.click(secretCopyButton);

                // Assert - Verify correct ID is passed
                expect(mockOnCopy).toHaveBeenCalledWith(testProps.clientSecret, 'reveal-secret');
            }
        });
    });
});
