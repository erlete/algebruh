// Constants:
const DEFAULT_ANSWER = "No image detected.";
const DEFAULT_EXPLANATION = "No image detected.";
const DEFAULT_TEXT = "No image detected.";

const MISSING_ANSWER = "No answer found.";
const MISSING_EXPLANATION = "No explanation found.";
const MISSING_TEXT = "No text found.";

const DATABASE_PATH = "databases/questions.json";

/**
 * Array of questions that prevents re-rendering of the same question.
 * @date 3/28/2023 - 9:02:47 PM
 *
 * @type {{ answer: string; explanation: string; text: string }} - Array of questions.
 */
const QUESTIONS = {};

/**
 * Fetch data from the database and store it in `window.data`.
 * @date 3/28/2023 - 6:47:30 PM
 *
 * @async
 */
async function setup() {
    window.data = await (await fetch(DATABASE_PATH)).json();
};

/**
 * Prevent default browser behavior on drag and drop events.
 * @date 3/28/2023 - 11:44:25 PM
 *
 * @param {*} event - Event object.
 */
function preventDefault(event) {
    event.preventDefault();
}

/**
 * Handle drop enter event.
 * @date 3/28/2023 - 6:44:44 PM
 *
 * @param {*} event - Event object.
 */
function dropEnter(event) {
    event.preventDefault();
    document.getElementById("answer").innerHTML = DEFAULT_ANSWER;
    document.getElementById("explanation").innerHTML = DEFAULT_EXPLANATION;
    document.getElementById("text-render").innerHTML = DEFAULT_TEXT;

    document.getElementById("text-render-div").style.display = "none";
    document.getElementById("text-render-btn-div").style.display = "none";
}

/**
 * Handle drop leave event.
 * @date 3/28/2023 - 6:45:01 PM
 *
 * @param {*} event - Event object.
 */
function dropLeave(event) {
    event.preventDefault();
    document.getElementById("answer").innerHTML = DEFAULT_ANSWER;
    document.getElementById("explanation").innerHTML = DEFAULT_EXPLANATION;
    document.getElementById("text-render").innerHTML = DEFAULT_TEXT;

    document.getElementById("text-render-div").style.display = "none";
    document.getElementById("text-render-btn-div").style.display = "none";
}

/**
 * Handle drag event.
 * @date 3/28/2023 - 6:45:09 PM
 *
 * @param {*} event - Event object.
 */
function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
}

/**
 * Handle drop event.
 * @date 3/28/2023 - 6:45:14 PM
 *
 * @param {*} event - Event object.
 */
function drop(event) {
    event.preventDefault();

    var timeout, valid;
    var url = event.dataTransfer.getData("text");
    var question_id = sanitize(url);
    var data = getFormattedData(question_id);

    if (QUESTIONS[question_id]) {
        timeout = 0;
        data = QUESTIONS[question_id];
    } else {
        timeout = Math.random() * 1000;
        if (Math.random() < 0.15) {
            if (data.answer == "<b>True</b>") {
                data.answer = "<b>False</b>";
            } else if (data.answer == "<b>False</b>") {
                data.answer = "<b>True</b>";
            }
            data.explanation = MISSING_ANSWER
        }
    }

    valid = data.answer != MISSING_ANSWER;

    if (valid) {
        if (!QUESTIONS[question_id]) {
            QUESTIONS[question_id] = data;
        }
    }

    setTimeout(() => {
        document.getElementById("answer").innerHTML = data.answer;
        document.getElementById("explanation").innerHTML = data.explanation;
        document.getElementById("text-render").innerHTML = data.text;

        if (valid) {
            document.getElementById("text-render-btn").style.display = "block";
            document.getElementById("text-render-btn-div").style.display = "block";
        }
    }, timeout);
}

/**
 * Extract file index from URL.
 * @date 3/28/2023 - 6:45:18 PM
 *
 * @param {string} url - URL to extract file index from.
 * @returns {string} - Extracted file index.
 */
function sanitize(url) {
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
 * @param {string} key - Key to be used to fetch data from `window.data`.
 * @returns {{ answer: string; explanation: string; text: string }} - Formatted data.
 */
function getFormattedData(key) {
    if (key in window.data) {
        return {
            "answer": format_answer(window.data[key].answer),
            "explanation": format_explanation(window.data[key].explanation),
            "text": format_text(window.data[key].text)
        };
    }
    return {
        "answer": format_answer(null),
        "explanation": format_explanation(null),
        "text": format_text(null)
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
