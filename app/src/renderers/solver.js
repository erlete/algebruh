/**
 * Fetch data from `database.json` and store it in `window.data`.
 * @date 3/28/2023 - 6:47:30 PM
 *
 * @async
 */
async function setup() {
    window.data = await (await fetch("database.json")).json();
};

/**
 * Handle drop enter event.
 * @date 3/28/2023 - 6:44:44 PM
 *
 * @param {*} event - Event object.
 */
function dropEnter(event) {
    event.preventDefault();
    document.getElementById("answer").innerHTML = "No image detected.";
    document.getElementById("explanation").innerHTML = "No image detected.";

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
    document.getElementById("answer").innerHTML = "No image detected.";
    document.getElementById("explanation").innerHTML = "No image detected.";

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

    var url = event.dataTransfer.getData("text");
    var id = sanitize(url);
    var data = getFormattedData(id);

    document.getElementById("answer").innerHTML = data.answer;
    document.getElementById("explanation").innerHTML = data.explanation;
    document.getElementById("text-render").innerHTML = data.text;

    if (data.answer != "No answer found.") {
        document.getElementById("text-render-btn").style.display = "block";
        document.getElementById("text-render-btn-div").style.display = "block";
    }
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
        return "No answer found.";
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
        return "No explanation found.";
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
        return "No text found.";
    }
    text = text.toString();
    return `<b>${text.charAt(0).toUpperCase()}${text.substring(1)}</b>`;
}

/**
 * Format data from `window.data` using a given key.
 * @date 3/28/2023 - 6:46:47 PM
 *
 * @param {string} key - Key to be used to fetch data from `window.data`.
 * @returns {{ answer: string; explanation: string; }} - Formatted data.
 */
function getFormattedData(key) {
    if (key in window.data) {
        return {
            "answer": format_answer(window.data[key].answer),
            "explanation": format_explanation(window.data[key].explanation),
            "text": window.data[key].text
        };
    }
    return {
        "answer": format_answer(null),
        "explanation": format_explanation(null),
        "text": format_text(null)
    };
};

function renderText() {
    var timeout = document.getElementById("text-render").innerHTML.length * 10;

    setTimeout(() => {
        document.getElementById("text-render-div").style.display = "block";
        document.getElementById("text-render-btn-div").style.display = "none";
    }, timeout);
}

// Fetch data and store it in `window.data`:
setup();
