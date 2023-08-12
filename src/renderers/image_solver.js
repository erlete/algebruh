const KEYS = ["answer", "explanation", "match", "confidence", "text"];
const DEFAULT_MESSAGE = "Arrastra una imagen para procesar resultados";

let lastInput = null;

// Data processing functions:

/**
 * Update progress bar with feedback from Tesseract.
 * @date 8/12/2023 - 3:47:41 AM
 *
 * @param {Object} message - Message from Tesseract.
 */
function updateTesseractProgress(message) {
    document.getElementById("tesseract-status").innerHTML = bold(TESSERACT_STATUS_TRANSLATION[message.status] || message.status);
    document.getElementById("tesseract-progress").innerHTML = bold(` (${Math.round(message.progress * 10000) / 100}%)`);
    document.getElementById("tesseract-progress-bar").value = message.progress;

    // If the process has finished, display final message:
    if (message.status === "recognizing text" && message.progress === 1) {
        document.getElementById("tesseract-progress").innerHTML = "";
        document.getElementById("tesseract-status").innerHTML = bold("Reconocimiento de texto completado");
    }
}

/**
 * Get results from input data.
 * @date 8/12/2023 - 3:47:08 AM
 *
 * @param {Event} event - Drop event.
 */
function getResults(event) {
    event.preventDefault();

    // Perform OCR:
    Tesseract.recognize(
        event.dataTransfer.files[0],
        "spa",
        { logger: message => updateTesseractProgress(message) }
    ).then(({ data: { text } }) => {
        text = text.trim();
        document.getElementById("text").innerHTML = text;
        const confidenceThreshold = document.getElementById("confidence-threshold").value;

        // If the text is not empty, process it, else display missing data message:
        if (text !== "") {
            const outputData = getFormattedData(text, confidenceThreshold);

            for (let key of KEYS) {
                document.getElementById(key).innerHTML = outputData[key];
            }
        } else {
            for (let key of KEYS) {
                document.getElementById(key).innerHTML = MISSING_MESSAGE;
            }
        }

        lastInput = text;
    })
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

    // Reset tesseract progress:
    document.getElementById("tesseract-progress").innerHTML = "";
    document.getElementById("tesseract-status").innerHTML = DEFAULT_MESSAGE;
    document.getElementById("tesseract-progress-bar").value = 0;
}

// Main function:

(() => {
    resetView();
    setup();
})();
