const MISSING_MESSAGE = "No se ha encontrado ningún resultado viable";
const DATABASE_PATH = "../src/databases/questions.json";

// Data fetching functions:

/**
 * Fetch data from the database and assign it to the global variable `window.data`.
 * @date 8/12/2023 - 3:44:08 AM
 *
 * @async
 * @returns {Promise<void>} - Database fetch promise.
 */
async function setup() {
    window.data = await (await fetch(DATABASE_PATH)).json();
};

// Data format functions:

/**
 * Convert text to bold.
 * @date 8/12/2023 - 3:09:39 AM
 *
 * @param {string} text - Text to convert.
 * @returns {string} - Bold text.
 */
function bold(text) {
    return text !== null && text !== undefined ? `<b>${text}</b>` : text;
}

/**
 * Convert boolean answer to readable text.
 * @date 8/12/2023 - 3:10:14 AM
 *
 * @param {boolean} answer - Answer.
 * @returns {string} - Formatted answer.
 */
function formatAnswer(answer) {
    return bold(answer ? "Verdadero" : "Falso");
}

/**
 * Convert explanation to bold or show missing message.
 * @date 8/12/2023 - 3:11:18 AM
 *
 * @param {string} explanation - Explanation. {@link null} if missing.
 * @returns {string} - Formatted explanation.
 */
function formatExplanation(explanation) {
    return explanation !== null ? bold(explanation) : MISSING_MESSAGE;
}

// Pattern matching functions:

/**
 * Get the best match for the given text and confidence threshold.
 * @date 8/12/2023 - 3:13:43 AM
 *
 * @param {string} text - Input text.
 * @param {number} confidenceThreshold - Confidence threshold.
 * @returns {{ text: any; confidence: string; answer: str | null; explanation: str | null; } | null} - Best match. {@link null} if no match.
 */
function getBestMatch(text, confidenceThreshold) {
    // Generate match array:
    let matchArray = Object.entries(window.data).map((questionData) => ({
        "text": questionData[0],
        "confidence": new difflib.SequenceMatcher(null, questionData[0], text).ratio(),
        "answer": questionData[1].answer,
        "explanation": questionData[1].explanation
    }));

    // Filter by confidence threshold and sort from higher to lower ratio:
    matchArray = matchArray.filter(match => match.confidence >= confidenceThreshold / 100);
    matchArray.sort((a, b) => b.confidence - a.confidence);

    // Return best match if available, else return null:
    return matchArray.length === 0 ? null : {
        "text": matchArray[0].text,
        "confidence": `${Math.round(matchArray[0].confidence * 10000) / 100}%`,
        "answer": matchArray[0].answer,
        "explanation": matchArray[0].explanation
    };
}

/**
 * Get formatter data for the given text and confidence threshold.
 * @date 8/12/2023 - 3:16:24 AM
 *
 * @param {string} text - Input text.
 * @param {number} confidenceThreshold - Confidence threshold.
 * @returns {{ text: string; match: string; confidence: string; answer: string; explanation: string; }} - Formatted data.
 */
function getFormattedData(text, confidenceThreshold) {
    const bestMatch = getBestMatch(text, confidenceThreshold);

    // Return formatted data if available, else default missing messages:
    return bestMatch === null ? {
        "text": bold(text),
        "match": MISSING_MESSAGE,
        "confidence": MISSING_MESSAGE,
        "answer": MISSING_MESSAGE,
        "explanation": MISSING_MESSAGE
    } : {
        "text": bold(text),
        "match": bold(bestMatch.text),
        "confidence": bold(bestMatch.confidence),
        "answer": formatAnswer(bestMatch.answer),
        "explanation": formatExplanation(bestMatch.explanation)
    }
};
