const DATABASE_PATH = "databases/questions.json";

function updateConfidenceThreshold() {
    const confidenceThreshold = document.getElementById("confidence-threshold").value;
    document.getElementById("confidence-threshold-value").innerHTML = confidenceThreshold;

    // If there has been any previous input, filter the result:
    if (lastInput !== null) {
        const outputData = getFormattedData(lastInput, confidenceThreshold);

        for (let key of KEYS) {
            document.getElementById(key).innerHTML = outputData[key];
        }
    }
}

/**
 * Get the best match for the given text and confidence threshold.
 * @date 8/11/2023 - 3:06:02 AM
 *
 * @param {string} text
 * @param {number} confidenceThreshold
 * @returns {{ data: Object; confidence: string; }} - Best match data and confidence.
 */
function getBestMatch(text, confidenceThreshold) {
    let matchArray = Object.keys(window.data).map(key => ({
        "id": key,
        "text": window.data[key].text,
        "similarity": new difflib.SequenceMatcher(null, window.data[key].text, text).ratio()
    }));

    // Filter by confidence threshold and sort from higher to lower ratio:
    matchArray = matchArray.filter(match => match.similarity >= confidenceThreshold / 100);
    matchArray.sort((a, b) => b.similarity - a.similarity);

    return matchArray.length === 0 ? null : {
        "data": window.data[matchArray[0].id],
        "confidence": `${Math.round(matchArray[0].similarity * 10000) / 100}%`
    };
}

/**
 * Format form data.
 * @date 8/11/2023 - 5:22:08 AM
 *
 * @param {string} text - Input text.
 * @param {number} confidenceThreshold - Confidence threshold.
 * @returns {{ answer: string; explanation: string; match: string; confidence: string; }} - Formatted data.
 */
function getFormattedData(text, confidenceThreshold) {
    const bestMatch = getBestMatch(text, confidenceThreshold);

    return bestMatch === null ? {
        "text": bold(text),
        "answer": MISSING_MESSAGE,
        "explanation": MISSING_MESSAGE,
        "match": MISSING_MESSAGE,
        "confidence": MISSING_MESSAGE
    } : {
        "text": bold(text),
        "answer": formatAnswer(bestMatch.data.answer),
        "explanation": formatExplanation(bestMatch.data.explanation),
        "match": bold(bestMatch.data.text),
        "confidence": bold(bestMatch.confidence)
    }
};

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
