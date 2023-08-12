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
    document.getElementById("tesseractStatus").innerHTML = bold(TESSERACT_STATUS_TRANSLATION[message.status] || message.status);
    document.getElementById("tesseractProgress").innerHTML = bold(` (${Math.round(message.progress * 10000) / 100}%)`);
    document.getElementById("tesseractProgressBar").value = message.progress;

    // If the process has finished, display final message:
    if (message.status === "recognizing text" && message.progress === 1) {
        document.getElementById("tesseractProgress").innerHTML = "";
        document.getElementById("tesseractStatus").innerHTML = bold("Reconocimiento de texto completado");
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
        const confidenceThreshold = document.getElementById("confidenceThreshold").value;

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
    const confidenceThreshold = document.getElementById("confidenceThreshold").value;
    document.getElementById("confidenceThresholdValue").innerHTML = confidenceThreshold;

    // Reset tesseract progress:
    document.getElementById("tesseractProgress").innerHTML = "";
    document.getElementById("tesseractStatus").innerHTML = DEFAULT_MESSAGE;
    document.getElementById("tesseractProgressBar").value = 0;
}

// Main function:

(() => {
    resetView();
    setup();
})();
