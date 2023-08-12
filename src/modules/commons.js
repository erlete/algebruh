/**
 * Convert text to bold.
 * @date 8/11/2023 - 3:05:43 AM
 *
 * @param {string} text
 * @returns {string} - Bold text.
 */
function bold(text) {
    return text !== null && text !== undefined ? `<b>${text}</b>` : text;
}

/**
 * Format answer to readable text.
 * @date 8/11/2023 - 7:00:21 PM
 *
 * @param {boolean} answer - Answer.
 * @returns {string} - Formatted answer.
 */
function formatAnswer(answer) {
    return bold(answer ? "Verdadero" : "Falso");
}

/**
 * Format explanation to readable text.
 * @date 8/11/2023 - 7:21:33 PM
 *
 * @param {string} explanation - Explanation. {@link null} if not available.
 * @returns {string} - Formatted explanation.
 */
function formatExplanation(explanation) {
    return explanation !== null ? bold(explanation) : MISSING_MESSAGE;
}

/**
 * Display alert tooltip.
 * @date 8/11/2023 - 7:00:46 PM
 *
 * @param {string} field - Field name.
 */
function showTooltip(field) {
    if (Object.keys(INFO).includes(field)) {
        alert(INFO[field]);
    }
}
