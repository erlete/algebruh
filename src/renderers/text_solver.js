// Constants:
const DEFAULT_ANSWER = "No text detected.";
const DEFAULT_EXPLANATION = "No text detected.";
const DEFAULT_TEXT = "No text detected.";

const MISSING_ANSWER = "No answer found.";
const MISSING_EXPLANATION = "No explanation found.";
const MISSING_TEXT = "No text found.";

const DATABASE_PATH = "databases/questions.json";

/**
 * gestaltSimilarity finds the gestalt similarity between two strings
 * @param first The first string to check
 * @param second The second string to check
 * @returns The gestalt similarity coefficient
 */
function similarity(first, second) {
    var stack = [first, second];
    var score = 0;
    while (stack.length != 0) {
        var first_sub_string = stack.pop();
        var second_sub_string = stack.pop();
        var longest_sequence_length = 0;
        var longest_sequence_index_1 = -1;
        var longest_sequence_index_2 = -1;
        for (var i = 0; i < first_sub_string.length; i++) {
            for (var j = 0; j < second_sub_string.length; j++) {
                var k = 0;
                while (i + k < first_sub_string.length && j + k < second_sub_string.length && first_sub_string.charAt(i + k) === second_sub_string.charAt(j + k)) {
                    k++;
                }
                if (k > longest_sequence_length) {
                    longest_sequence_length = k;
                    longest_sequence_index_1 = i;
                    longest_sequence_index_2 = j;
                }
            }
        }
        if (longest_sequence_length > 0) {
            score += longest_sequence_length * 2;
            if (longest_sequence_index_1 !== 0 && longest_sequence_index_2 !== 0) {
                stack.push(first_sub_string.substring(0, longest_sequence_index_1));
                stack.push(second_sub_string.substring(0, longest_sequence_index_2));
            }
            if (longest_sequence_index_1 + longest_sequence_length !== first_sub_string.length &&
                longest_sequence_index_2 + longest_sequence_length !== second_sub_string.length) {
                stack.push(first_sub_string.substring(longest_sequence_index_1 + longest_sequence_length, first_sub_string.length));
                stack.push(second_sub_string.substring(longest_sequence_index_2 + longest_sequence_length, second_sub_string.length));
            }
        }
    }
    return score / (first.length + second.length);
}

/**
 * Fetch data from the database and store it in `window.data`.
 * @date 3/28/2023 - 6:47:30 PM
 *
 * @async
 */
async function setup() {
    window.data = await (await fetch(DATABASE_PATH)).json();
};

function clearForm() {
    document.getElementById("answer").innerHTML = DEFAULT_ANSWER;
    document.getElementById("explanation").innerHTML = DEFAULT_EXPLANATION;
    document.getElementById("match").innerHTML = DEFAULT_TEXT;
    document.getElementById("confidence").innerHTML = DEFAULT_TEXT;
}

function onSubmit() {
    clearForm();

    let timeout;
    const text = document.getElementById("search_text").value;
    const {match, confidence} = getFormattedData(text);

    console.log(match, confidence);

    setTimeout(() => {
        document.getElementById("answer").innerHTML = match.answer;
        document.getElementById("explanation").innerHTML = match.explanation;
        document.getElementById("match").innerHTML = match.text;
        document.getElementById("confidence").innerHTML = confidence;
    }, timeout);
}

/**
 * Extract file index from URL.
 * @date 3/28/2023 - 6:45:18 PM
 *
 * @param {string} url - URL to extract file index from.
 * @returns {string} - Extracted file index.
 */
function getFileIndex(url) {
    var match = url.match(/download_[0]*(\d*)/);

    if (match) {
        return match[1];
    }
    return null;
}

/**
 * Format answer.
 * @date 3/28/2023 - 6:45:33 PM
 *
 * @param {*} answer - Answer to be formatted.
 * @returns {string} - Formatted answer. "No answer found" if answer is empty.
 */
function format_answer(answer) {
    if (answer == null || answer == undefined) {
        return MISSING_ANSWER;
    }
    answer = answer.toString();
    return `<b>${answer.charAt(0).toUpperCase()}${answer.substring(1)}</b>`;
}

/**
 * Format explanation.
 * @date 3/28/2023 - 6:45:33 PM
 *
 * @param {*} explanation - Explanation to be formatted.
 * @returns {string} - Formatted explanation. "No explanation found" if explanation is empty.
 */
function format_explanation(explanation) {
    if (explanation == null || explanation == undefined) {
        return MISSING_EXPLANATION;
    }
    explanation = explanation.toString();
    return `<b>${explanation.charAt(0).toUpperCase()}${explanation.substring(1)}</b>`;
}


/**
 * Format text.
 * @date 3/28/2023 - 7:39:29 PM
 *
 * @param {*} text - Text to be formatted.
 * @returns {string} - Formatted text. "No text found" if text is empty.
 */
function format_text(text) {
    if (text == null || text == undefined) {
        return MISSING_TEXT;
    }
    text = text.toString();
    return `<b>${text.charAt(0).toUpperCase()}${text.substring(1)}</b>`;
}

/**
 * Format data from `window.data` using a given key.
 * @date 3/28/2023 - 6:46:47 PM
 *
 * @param {string} text - Key to be used to fetch data from `window.data`.
 * @returns {{ answer: string; explanation: string; text: string }} - Formatted data.
 */
function getFormattedData(text) {
    const similar = Object.keys(window.data).map((key) => {
        return {
            "id": key,
            "text": window.data[key].text,
            "similarity": new difflib.SequenceMatcher(null, window.data[key].text, text).ratio()
        };
    });

    similar.sort((a, b) => {
        return b.similarity - a.similarity;
    });

    return {
        "match": window.data[similar[0].id],
        // set confidence over 100% with two decimal places
        "confidence": `${Math.round(similar[0].similarity * 10000) / 100}%`
    };
};

function renderText() {
    var timeout = document.getElementById("text-render").innerHTML.length * 6.9420;

    setTimeout(() => {
        document.getElementById("text-render-div").style.display = "block";
        document.getElementById("text-render-btn-div").style.display = "none";
    }, timeout);
}

// Fetch data and store it in `window.data`:
setup();
