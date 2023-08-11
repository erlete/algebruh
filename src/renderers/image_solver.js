const KEYS = ["answer", "explanation", "match", "confidence", "scannedText"];
const DEFAULT_MESSAGE = "Arrastra una imagen para procesar resultados";
const MISSING_MESSAGE = "No se ha encontrado ningún resultado viable";

const DATABASE_PATH = "databases/questions.json";

const TESSERACT_STATUS_TRANSLATION = {
    "loading tesseract core": "Cargando núcleo de Tesseract",
    "initializing tesseract": "Inicializando Tesseract",
    "initialized tesseract": "Tesseract inicializado",
    "loading language traineddata": "Cargando datos de entrenamiento de idioma",
    "loading language traineddata (from cache)": "Cargando datos de entrenamiento de idioma (desde caché)",
    "loaded language traineddata": "Datos de entrenamiento de idioma cargados",
    "initializing api": "Inicializando API",
    "initialized api": "API inicializada",
    "recognizing text": "Reconociendo texto"
}

const INFO = {
    "imageInput": "",
    "tesseractProgress": "",
    "tesseractStatus": "",
    "answer": "",
    "explanation": "",
    "match": "",
    "confidence": "",
    "scannedText": ""
}

let lastScan = null;

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
        lastScan = text;
        document.getElementById("scannedText").innerHTML = text;

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

function updateConfidenceThreshold() {
    const confidenceThreshold = document.getElementById("confidence-threshold").value;
    document.getElementById("confidence-threshold-value").innerHTML = confidenceThreshold;

    if (lastScan !== null) {
        const outputData = getFormattedData(lastScan, confidenceThreshold);

        for (let key of KEYS) {
            document.getElementById(key).innerHTML = outputData[key];
        }
    }
}

/**
 * Display alert tooltip.
 * @date 8/11/2023 - 7:00:46 PM
 *
 * @param {string} field - Field name.
 */
function showTooltip(field) {
    if (Object.keys(INFO).includes(field)) {
        alert(INFO[field]);
    }
}

/**
 * Get the best match for the given text and confidence threshold.
 * @date 8/11/2023 - 3:06:02 AM
 *
 * @param {string} text
 * @param {number} confidenceThreshold
 * @returns {{ data: Object; confidence: string; }} - Best match data and confidence.
 */
function getBestMatch(text, confidenceThreshold) {
    let matchArray = Object.keys(window.data).map(key => ({
        "id": key,
        "text": window.data[key].text,
        "similarity": new difflib.SequenceMatcher(null, window.data[key].text, text).ratio()
    }));

    // Filter by confidence threshold and sort from higher to lower ratio:
    matchArray = matchArray.filter(match => match.similarity >= confidenceThreshold / 100);
    matchArray.sort((a, b) => b.similarity - a.similarity);

    return matchArray.length === 0 ? null : {
        "data": window.data[matchArray[0].id],
        "confidence": `${Math.round(matchArray[0].similarity * 10000) / 100}%`
    };
}
/**
 * Convert text to bold.
 * @date 8/11/2023 - 3:05:43 AM
 *
 * @param {string} text
 * @returns {string} - Bold text.
 */
function bold(text) {
    return text !== null && text !== undefined ? `<b>${text}</b>` : text;
}

/**
 * Format form data.
 * @date 8/11/2023 - 5:22:08 AM
 *
 * @param {string} text - Input text.
 * @param {number} confidenceThreshold - Confidence threshold.
 * @returns {{ answer: string; explanation: string; match: string; confidence: string; }} - Formatted data.
 */
function getFormattedData(text, confidenceThreshold) {
    const bestMatch = getBestMatch(text, confidenceThreshold);

    return bestMatch === null ? {
        "scannedText": bold(text),
        "match": MISSING_MESSAGE,
        "confidence": MISSING_MESSAGE,
        "answer": MISSING_MESSAGE,
        "explanation": MISSING_MESSAGE
    } : {
        "scannedText": bold(text),
        "match": bold(bestMatch.data.text),
        "confidence": bold(bestMatch.confidence),
        "answer": formatAnswer(bestMatch.data.answer),
        "explanation": formatExplanation(bestMatch.data.explanation)
    }
};

/**
 * Format answer to readable text.
 * @date 8/11/2023 - 7:00:21 PM
 *
 * @param {boolean} answer - Answer.
 * @returns {string} - Formatted answer.
 */
function formatAnswer(answer) {
    return bold(answer ? "Verdadero" : "Falso");
}

/**
 * Format explanation to readable text.
 * @date 8/11/2023 - 7:21:33 PM
 *
 * @param {string} explanation - Explanation. {@link null} if not available.
 * @returns {string} - Formatted explanation.
 */
function formatExplanation(explanation) {
    return explanation !== null ? bold(explanation) : MISSING_MESSAGE;
}

function resetView() {
    // Clear form:
    for (let key of KEYS) {
        document.getElementById(key).innerHTML = DEFAULT_MESSAGE;
    }

    // Set dynamic range input value:
    const confidenceThreshold = document.getElementById("confidence-threshold").value;
    document.getElementById("confidence-threshold-value").innerHTML = confidenceThreshold;

    document.getElementById("tesseract-progress").innerHTML = "";
    document.getElementById("tesseract-status").innerHTML = DEFAULT_MESSAGE;
    document.getElementById("tesseract-progress-bar").value = 0;
}

/**
 * Set up form fields and window data.
 * @date 8/11/2023 - 5:59:23 AM
 *
 * @async
 * @returns {Promise<void>}
 */
async function setup() {
    resetView();
    window.data = await (await fetch(DATABASE_PATH)).json();
};

setup();
