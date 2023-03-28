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
    document.getElementById("answer").innerHTML = "Drop the image to get the answer";
    document.getElementById("explanation").innerHTML = "Drop the image to get the explanation";
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
    var data = event.dataTransfer.getData("text");
    data = getFormattedData(sanitize(data));

    document.getElementById("answer").innerHTML = data.answer;
    document.getElementById("explanation").innerHTML = data.explanation;
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
 * @param {string} answer - Answer to be formatted.
 * @returns {string} - Formatted answer. "No answer found" if answer is empty.
 */
function format_answer(answer) {
    if (answer == "") {
        return "No answer found";
    }
    return `<b>${answer}</b>`;
}

/**
 * Format explanation.
 * @date 3/28/2023 - 6:45:33 PM
 *
 * @param {string} explanation - Explanation to be formatted.
 * @returns {string} - Formatted explanation. "No explanation found" if explanation is empty.
 */
function format_explanation(explanation) {
    if (explanation == "") {
        return "No explanation found";
    }
    return `<b>${explanation}</b>`;
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
            "explanation": format_explanation(window.data[key].explanation)
        };
    }
    return {
        "answer": format_answer(""),
        "explanation": format_explanation("")
    };
};

// Fetch data and store it in `window.data`:
setup();
