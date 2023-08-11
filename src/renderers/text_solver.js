const KEYS = ["answer", "explanation", "match", "confidence"];
const DEFAULT_MESSAGE = "No text detected";
const MISSING_MESSAGE = "No suitable match found";

const DATABASE_PATH = "databases/questions.json";

/**
 * Update the form on new inputs.
 * @date 8/11/2023 - 3:07:19 AM
 */
function updateForm() {
    const searchText = document.getElementById("search-text").value;
    const confidenceThreshold = document.getElementById("confidence-threshold").value;
    document.getElementById("confidence-threshold-value").innerHTML = confidenceThreshold;

    if (searchText !== "") {
        const outputData = getFormattedData(searchText, confidenceThreshold);

        for (let key of KEYS) {
            document.getElementById(key).innerHTML = outputData[key];
        }
    } else {
        // Clear form:
        for (let key of KEYS) {
            document.getElementById(key).innerHTML = DEFAULT_MESSAGE;
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
        "answer": MISSING_MESSAGE,
        "explanation": MISSING_MESSAGE,
        "match": MISSING_MESSAGE,
        "confidence": MISSING_MESSAGE
    } : {
        "answer": bold(bestMatch.data.answer),
        "explanation": bold(bestMatch.data.explanation),
        "match": bold(bestMatch.data.text),
        "confidence": bold(bestMatch.confidence)
    }
};

/**
 * Set up form fields and window data.
 * @date 8/11/2023 - 5:22:45 AM
 *
 * @async
 * @returns {Promise<void>}
 */
async function setup() {
    // Clear form:
    for (let key of KEYS) {
        document.getElementById(key).innerHTML = DEFAULT_MESSAGE;
    }

    window.data = await (await fetch(DATABASE_PATH)).json();
};

setup();
