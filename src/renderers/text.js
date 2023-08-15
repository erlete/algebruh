const KEYS = ["answer", "explanation", "match", "confidence"];
const DEFAULT_MESSAGE = "Introduce tu búsqueda para procesar resultados";

let lastInput = null;

// Data processing functions:

/**
 * Get results from input data.
 * @date 8/12/2023 - 3:46:49 AM
 */
function getResults() {
    const text = document.getElementById("input").value;

    // If the text is not empty, process it, else display default message:
    if (text !== "") {
        const outputData = getFormattedData(text);

        for (let key of KEYS) {
            document.getElementById(key).innerHTML = outputData[key];
        }
    } else {
        for (let key of KEYS) {
            document.getElementById(key).innerHTML = DEFAULT_MESSAGE;
        }
    }

    lastInput = text;
}

// Auxiliary functions:

function resetView() {
    // Clear form:
    for (let key of KEYS) {
        document.getElementById(key).innerHTML = DEFAULT_MESSAGE;
    }
}

// Main function:

(() => {
    resetView();
    setup();
})();
