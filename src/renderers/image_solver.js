const KEYS = ["answer", "explanation", "match", "confidence", "text"];
const DEFAULT_MESSAGE = "Arrastra una imagen para procesar resultados";
const MISSING_MESSAGE = "No se ha encontrado ningún resultado viable";

let lastInput = null;

function updateProgress(message) {
    document.getElementById("tesseract-status").innerHTML = bold(TESSERACT_STATUS_TRANSLATION[message.status] || message.status);
    document.getElementById("tesseract-progress").innerHTML = bold(` (${Math.round(message.progress * 10000) / 100}%)`);
    document.getElementById("tesseract-progress-bar").value = message.progress;

    if (message.status === "recognizing text" && message.progress === 1) {
        document.getElementById("tesseract-progress").innerHTML = "";
        document.getElementById("tesseract-status").innerHTML = bold("Reconocimiento de texto completado");
    }
}

/**
 * Handle drop enter event.
 * @date 3/28/2023 - 6:44:44 PM
 *
 * @param {*} event - Event object.
 */
function dropEnter(event) {
    event.preventDefault();
    resetView();
}

/**
 * Handle drop event.
 * @date 3/28/2023 - 6:45:14 PM
 *
 * @param {*} event - Event object.
 */
function drop(event) {
    event.preventDefault();

    Tesseract.recognize(
        event.dataTransfer.files[0],
        "spa",
        { logger: message => updateProgress(message) }
    ).then(({ data: { text } }) => {
        text = text.trim();
        lastInput = text;
        document.getElementById("text").innerHTML = text;

        const confidenceThreshold = document.getElementById("confidence-threshold").value;

        if (text !== "") {
            const outputData = getFormattedData(text, confidenceThreshold);

            for (let key of KEYS) {
                document.getElementById(key).innerHTML = outputData[key];
            }
        } else {
            // Clear form:
            for (let key of KEYS) {
                document.getElementById(key).innerHTML = MISSING_MESSAGE;
            }
        }
    })
}

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

setup();
