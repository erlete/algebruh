const KEYS = ["answer", "explanation", "match", "confidence"];
const DEFAULT_MESSAGE = "Introduce tu búsqueda para procesar resultados";

let lastInput = null;

// Data processing functions:

/**
 * Get results from input data.
 * @date 8/12/2023 - 3:46:49 AM
 */
function getResults() {
    const text = document.getElementById("search-text").value;
    const confidenceThreshold = document.getElementById("confidence-threshold").value;
    document.getElementById("confidence-threshold-value").innerHTML = confidenceThreshold;

    // If the text is not empty, process it, else display default message:
    if (text !== "") {
        const outputData = getFormattedData(text, confidenceThreshold);

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

    // Set dynamic range input value:
    const confidenceThreshold = document.getElementById("confidence-threshold").value;
    document.getElementById("confidence-threshold-value").innerHTML = confidenceThreshold;
}

// Main function:

(() => {
    resetView();
    setup();
})();
