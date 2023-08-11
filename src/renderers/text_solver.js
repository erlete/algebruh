// Constants:
const DEFAULT = {
    "answer": "No text detected",
    "explanation": "No text detected",
    "match": "No text detected",
    "confidence": "No text detected"
}
const MISSING = {
    "answer": "No answer found",
    "explanation": "No explanation found",
    "match": "No match found",
    "confidence": ""
}
const KEYS = Object.keys(DEFAULT);
const DATABASE_PATH = "databases/questions.json";

/**
 * Update the form on new inputs.
 * @date 8/11/2023 - 3:07:19 AM
 */
function updateForm() {
    // Clear form:
    for (let key of KEYS) {
        document.getElementById(key).innerHTML = DEFAULT[key];
    }

    // Input data:
    const text = document.getElementById("search_text").value;
    const confidenceThreshold = document.getElementById("confidence-threshold").value;
    document.getElementById("confidence-threshold-value").innerHTML = confidenceThreshold;

    // Output data:
    const data = getFormattedData(text, confidenceThreshold);
    for (let key of KEYS) {
        document.getElementById(key).innerHTML = data[key];
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
    // Get match map:
    let matches = Object.keys(window.data).map((key) => {
        return {
            "id": key,
            "text": window.data[key].text,
            "similarity": new difflib.SequenceMatcher(null, window.data[key].text, text).ratio()
        };
    });

    // Filter by confidence threshold and sort from higher to lower ratio:
    matches = matches.filter(match => match.similarity >= confidenceThreshold / 100);
    matches.sort((a, b) => b.similarity - a.similarity);

    return matches.length === 0 ? null : {
        "data": window.data[matches[0].id],
        // Set confidence over 100% with two decimal places
        "confidence": `${Math.round(matches[0].similarity * 10000) / 100}%`
    };
}

/**
 * Convert text to bold.
 * @date 8/11/2023 - 3:05:43 AM
 *
 * @param {string} text
 * @returns {string} - Bold text.
 */
function bold(text) {
    return text !== null && text !== undefined ? `<b>${text}</b>` : text
}

/**
 * Format data from `window.data` using a given key.
 * @date 3/28/2023 - 6:46:47 PM
 *
 * @param {string} text - Key to be used to fetch data from `window.data`.
 * @returns {{ answer: string; explanation: string; text: string }} - Formatted data.
 */
function getFormattedData(text, confidenceThreshold) {
    const bestMatch = getBestMatch(text, confidenceThreshold);

    return bestMatch === null ? MISSING : {
        "answer": bold(bestMatch.data.answer),
        "explanation": bold(bestMatch.data.explanation),
        "match": bold(bestMatch.data.text),
        "confidence": bold(bestMatch.confidence)
    }
};

/**
 * Fetch data from the database and store it in `window.data`.
 * @date 3/28/2023 - 6:47:30 PM
 *
 * @async
 */
async function setup() {
    window.data = await (await fetch(DATABASE_PATH)).json();
};

// Fetch data and store it in `window.data`:
setup();
