/**
 * Accessibility Audit Utilities
 * Runtime checks for keyboard navigation and focus management
 */

export const a11yAudit = {
  /**
   * Check if all interactive elements have visible focus indicators
   */
  checkFocusIndicators: () => {
    const interactive = document.querySelectorAll(
      'button, a, input, textarea, select, [tabindex]'
    );
    const issues = [];

    interactive.forEach((el) => {
      const styles = window.getComputedStyle(el);
      const outline = styles.outline;
      const boxShadow = styles.boxShadow;

      // Check if element has any focus indicator
      if (outline === 'none rgba(0, 0, 0, 0)' && boxShadow === 'none') {
        issues.push({
          element: el.tagName,
          class: el.className,
          text: el.textContent?.substring(0, 50) || 'N/A',
          issue: 'No visible focus indicator',
        });
      }
    });

    return {
      passed: interactive.length - issues.length,
      total: interactive.length,
      issues,
    };
  },

  /**
   * Verify tab order is logical (positive tabindex should be avoided)
   */
  checkTabOrder: () => {
    const tabindexElements = document.querySelectorAll('[tabindex]');
    const issues = [];

    tabindexElements.forEach((el) => {
      const tabindex = parseInt(el.getAttribute('tabindex'), 10);
      if (tabindex > 0) {
        issues.push({
          element: el.tagName,
          tabindex,
          issue: 'Positive tabindex found (avoid - breaks logical flow)',
        });
      }
    });

    return {
      status: issues.length === 0 ? 'PASS' : 'ISSUES FOUND',
      issues,
    };
  },

  /**
   * Check form labels are properly associated
   */
  checkFormLabels: () => {
    const inputs = document.querySelectorAll('input, textarea, select');
    const issues = [];

    inputs.forEach((input) => {
      const id = input.id;
      const label = id ? document.querySelector(`label[for="${id}"]`) : null;
      const ariaLabel = input.getAttribute('aria-label');

      if (!label && !ariaLabel && !input.name) {
        issues.push({
          element: input.tagName,
          type: input.type,
          issue: 'No associated label or aria-label',
        });
      }
    });

    return {
      passed: inputs.length - issues.length,
      total: inputs.length,
      issues,
    };
  },

  /**
   * Check for keyboard trap patterns
   */
  checkKeyboardTraps: () => {
    // This is more of a manual test, but we can check for obvious traps
    const allFocusable = document.querySelectorAll(
      'button, a, input, textarea, select, [tabindex]'
    );

    if (allFocusable.length === 0) {
      return { status: 'WARNING', message: 'No focusable elements found' };
    }

    return {
      status: 'MANUAL TEST REQUIRED',
      message: 'Tab through the page and verify you can reach all elements',
      focusableCount: allFocusable.length,
    };
  },

  /**
   * Generate full accessibility report
   */
  generateReport: () => {
    return {
      timestamp: new Date().toISOString(),
      focusIndicators: a11yAudit.checkFocusIndicators(),
      tabOrder: a11yAudit.checkTabOrder(),
      formLabels: a11yAudit.checkFormLabels(),
      keyboardTraps: a11yAudit.checkKeyboardTraps(),
    };
  },
};

// Auto-run on page load in development
if (process.env.NODE_ENV === 'development') {
  if (typeof window !== 'undefined') {
    window.a11yReport = () => console.log(a11yAudit.generateReport());
  }
}
