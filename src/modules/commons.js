const DATABASE_PATH = "databases/questions.json";

const MISSING_MESSAGE = "No se ha encontrado ningún resultado viable";

const INFO = {
    "textSolver": {
        "input": "Introduce la pregunta que quieres resolver. Tu búsqueda debe ser lo más parecida posible a las preguntas disponibles en la base de datos.\n\nCuanta más información contenga la búsqueda, mayor será la probabilidad de obtener un resultado satisfactorio.",
        "confidenceThreshold": "Usa este slider para ajustar el porcentaje de coincidencia mínimo que debe tener la pregunta encontrada con tu búsqueda.\n\nSi el programa no encuentra coincidencias para tu búsqueda, reduce el porcentaje. Si quieres una coincidencia más precisa, auméntalo.",
        "match": "Este campo contiene la coincidencia encontrada más aproximada a tu búsqueda.",
        "confidence": "Este campo contiene el porcentaje de similitud entre tu búsqueda y la mejor coincidencia encontrada.",
        "answer": "Este campo contiene la respuesta a la coincidencia aproximada a tu pregunta.\n\nRecuerda revisar que la coincidencia sea parecida o igual a tu pregunta original.",
        "explanation": "Este campo contiene la explicación de la respuesta, si existe en la base de datos."
    },
    "imageSolver": {
        "input": "Arrastra una imagen de la pregunta que quieras buscar. Sirven capturas de pantalla, imagenes, etc.\n\nRecuerda encuadrar lo máximo posible el texto a buscar y reducir las posibilidades de falsos reconocimientos.",
        "confidenceThreshold": "Usa este slider para ajustar el porcentaje de coincidencia mínimo que debe tener la pregunta encontrada con tu búsqueda.\n\nSi el programa no encuentra coincidencias para tu búsqueda, reduce el porcentaje. Si quieres una coincidencia más precisa, auméntalo.",
        "text": "Este campo contiene el texto escaneado de la imagen.",
        "match": "Este campo contiene la coincidencia encontrada más aproximada a tu búsqueda.",
        "confidence": "Este campo contiene el porcentaje de similitud entre tu búsqueda y la mejor coincidencia encontrada.",
        "answer": "Este campo contiene la respuesta a la coincidencia aproximada a tu pregunta.\n\nRecuerda revisar que la coincidencia sea parecida o igual a tu pregunta original.",
        "explanation": "Este campo contiene la explicación de la respuesta, si existe en la base de datos.",
        "tesseractStatus": "Este campo contiene el estado de reconocimiento de texto de Tesseract.",
        "tesseractProgress": "Este campo contiene el progreso de cada estado de procesamiento de Tesseract."
    }
}

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

// Data fetching functions:

/**
 * Fetch data from the database and assign it to the global variable `window.data`.
 * @date 8/12/2023 - 3:44:08 AM
 *
 * @async
 * @returns {Promise<void>} - Database fetch promise.
 */
async function setup() {
    window.data = await (await fetch(DATABASE_PATH)).json();
};

// Data format functions:

/**
 * Convert text to bold.
 * @date 8/12/2023 - 3:09:39 AM
 *
 * @param {string} text - Text to convert.
 * @returns {string} - Bold text.
 */
function bold(text) {
    return text !== null && text !== undefined ? `<b>${text}</b>` : text;
}

/**
 * Convert boolean answer to readable text.
 * @date 8/12/2023 - 3:10:14 AM
 *
 * @param {boolean} answer - Answer.
 * @returns {string} - Formatted answer.
 */
function formatAnswer(answer) {
    return bold(answer ? "Verdadero" : "Falso");
}

/**
 * Convert explanation to bold or show missing message.
 * @date 8/12/2023 - 3:11:18 AM
 *
 * @param {string} explanation - Explanation. {@link null} if missing.
 * @returns {string} - Formatted explanation.
 */
function formatExplanation(explanation) {
    return explanation !== null ? bold(explanation) : MISSING_MESSAGE;
}

// Pattern matching functions:

/**
 * Get the best match for the given text and confidence threshold.
 * @date 8/12/2023 - 3:13:43 AM
 *
 * @param {string} text - Input text.
 * @param {number} confidenceThreshold - Confidence threshold.
 * @returns {{ text: any; confidence: string; answer: str | null; explanation: str | null; } | null} - Best match. {@link null} if no match.
 */
function getBestMatch(text, confidenceThreshold) {
    // Generate match array:
    let matchArray = Object.keys(window.data).map(key => ({
        "text": window.data[key].text,
        "confidence": new difflib.SequenceMatcher(null, window.data[key].text, text).ratio(),
        "answer": window.data[key].answer,
        "explanation": window.data[key].explanation
    }));

    // Filter by confidence threshold and sort from higher to lower ratio:
    matchArray = matchArray.filter(match => match.confidence >= confidenceThreshold / 100);
    matchArray.sort((a, b) => b.confidence - a.confidence);

    // Return best match if available, else return null:
    return matchArray.length === 0 ? null : {
        "text": matchArray[0].text,
        "confidence": `${Math.round(matchArray[0].confidence * 10000) / 100}%`,
        "answer": matchArray[0].answer,
        "explanation": matchArray[0].explanation
    };
}

/**
 * Get formatter data for the given text and confidence threshold.
 * @date 8/12/2023 - 3:16:24 AM
 *
 * @param {string} text - Input text.
 * @param {number} confidenceThreshold - Confidence threshold.
 * @returns {{ text: string; match: string; confidence: string; answer: string; explanation: string; }} - Formatted data.
 */
function getFormattedData(text, confidenceThreshold) {
    const bestMatch = getBestMatch(text, confidenceThreshold);

    // Return formatted data if available, else default missing messages:
    return bestMatch === null ? {
        "text": bold(text),
        "match": MISSING_MESSAGE,
        "confidence": MISSING_MESSAGE,
        "answer": MISSING_MESSAGE,
        "explanation": MISSING_MESSAGE
    } : {
        "text": bold(text),
        "match": bold(bestMatch.text),
        "confidence": bold(bestMatch.confidence),
        "answer": formatAnswer(bestMatch.answer),
        "explanation": formatExplanation(bestMatch.explanation)
    }
};

// Event functions:

/**
 * Update output data when minimum confidence threshold is changed.
 * @date 8/12/2023 - 3:12:55 AM
 */
function updateMatchThreshold() {
    const confidenceThreshold = document.getElementById("confidenceThreshold").value;
    document.getElementById("confidenceThresholdValue").innerHTML = confidenceThreshold;

    // If there has been any previous input, filter the result:
    if (lastInput !== null) {
        const outputData = getFormattedData(lastInput, confidenceThreshold);

        for (let key of KEYS) {
            document.getElementById(key).innerHTML = outputData[key];
        }
    }
}

// Auxiliary functions:

/**
 * Display tooltip with information for the given element and page.
 * @date 8/12/2023 - 3:35:21 AM
 *
 * @param {string} elementID - ID of the element to display tooltip for.
 * @param {string} pageID - ID of the page where the element is located.
 */
function displayTooltip(elementID, pageID) {
    if (Object.keys(INFO).includes(pageID)) {
        if (Object.keys(INFO[pageID]).includes(elementID)) {
            alert(INFO[pageID][elementID]);
        } else {
            console.warn(`No info for element ${elementID} in page ${pageID}`);
        }
    } else {
        console.warn(`No info for page ${pageID}`);
    }
}
