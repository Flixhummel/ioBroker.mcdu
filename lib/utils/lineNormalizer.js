'use strict';

/**
 * Line Normalizer
 *
 * Converts between old line format (leftButton/display/rightButton)
 * and new left/right column model.
 *
 * Old format:
 *   { row, subLabel, leftButton, display, rightButton }
 *
 * New format:
 *   { row, left: { label, display, button }, right: { label, display, button } }
 */

const EMPTY_SIDE = {
    label: '',
    display: { type: 'empty' },
    button: { type: 'empty' }
};

/**
 * Detect whether a line config uses the old format
 * @param {object} lineConfig - Line configuration
 * @returns {boolean}
 */
function isOldFormat(lineConfig) {
    return lineConfig && (
        lineConfig.hasOwnProperty('display') ||
        lineConfig.hasOwnProperty('leftButton') ||
        lineConfig.hasOwnProperty('rightButton') ||
        lineConfig.hasOwnProperty('subLabel')
    ) && !lineConfig.hasOwnProperty('left') && !lineConfig.hasOwnProperty('right');
}

/**
 * Normalize a line config to the new left/right format.
 * If already in new format, returns as-is. If old format, converts.
 * @param {object} lineConfig - Line configuration (old or new format)
 * @returns {object} Normalized line config in new format
 */
function normalizeLine(lineConfig) {
    if (!lineConfig) return null;

    // Already in new format
    if (lineConfig.left || lineConfig.right) {
        return {
            row: lineConfig.row,
            left: { ...EMPTY_SIDE, ...lineConfig.left },
            right: { ...EMPTY_SIDE, ...lineConfig.right }
        };
    }

    // Convert old format to new
    const left = {
        label: lineConfig.subLabel || '',
        display: { type: 'empty' },
        button: lineConfig.leftButton || { type: 'empty' }
    };

    const right = {
        label: '',
        display: { type: 'empty' },
        button: lineConfig.rightButton || { type: 'empty' }
    };

    // Map old single `display` field to left side by default
    if (lineConfig.display && lineConfig.display.type !== 'empty') {
        const display = { ...lineConfig.display };
        // Support both 'label' and 'text' field names
        if (display.label && !display.text) {
            display.text = display.label;
        }
        left.display = display;
    }

    return {
        row: lineConfig.row,
        left,
        right
    };
}

/**
 * Normalize all lines in a page config
 * @param {object} pageConfig - Page configuration
 * @returns {object} Page config with normalized lines
 */
function normalizePageLines(pageConfig) {
    if (!pageConfig || !pageConfig.lines) return pageConfig;

    return {
        ...pageConfig,
        lines: pageConfig.lines.map(normalizeLine)
    };
}

/**
 * Get display text from a display config (supports both 'text' and 'label' fields)
 * @param {object} displayConfig - Display configuration
 * @returns {string}
 */
function getDisplayText(displayConfig) {
    if (!displayConfig) return '';
    return displayConfig.text || displayConfig.label || '';
}

module.exports = {
    isOldFormat,
    normalizeLine,
    normalizePageLines,
    getDisplayText,
    EMPTY_SIDE
};
