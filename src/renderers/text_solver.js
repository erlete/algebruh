const KEYS = ["answer", "explanation", "match", "confidence"];
const DEFAULT_MESSAGE = "Introduce tu búsqueda para procesar resultados";
const MISSING_MESSAGE = "No se ha encontrado ningún resultado viable";
const INFO = {
    "textInput": "Introduce la pregunta que quieres resolver. Tu búsqueda debe ser lo más parecida posible a las preguntas disponibles en la base de datos.\n\nCuanta más información contenga la búsqueda, mayor será la probabilidad de obtener un resultado satisfactorio.",
    "confidenceThresholdInput": "Usa este slider para ajustar el porcentaje de coincidencia mínimo que debe tener la pregunta encontrada con tu búsqueda.\n\nSi el programa no encuentra coincidencias para tu búsqueda, reduce el porcentaje. Si quieres una coincidencia más precisa, auméntalo.",
    "answer": "Este campo contiene la respuesta a la coincidencia aproximada a tu pregunta. Recuerda revisar que la coincidencia sea parecida o igual a tu pregunta original.",
    "explanation": "Este campo contiene la explicación de la respuesta, si existe en la base de datos.",
    "match": "Este campo contiene la coincidencia encontrada más aproximada a tu búsqueda.",
    "confidence": "Este campo contiene el porcentaje de similitud entre tu búsqueda y la mejor coincidencia encontrada."
}

const DATABASE_PATH = "databases/questions.json";

/**
 * Update the form on new inputs.
 * @date 8/11/2023 - 3:07:19 AM
 */
function updateForm() {
    const searchText = document.getElementById("search-text").value;
    const confidenceThreshold = document.getElementById("confidence-threshold").value;
    document.getElementById("confidence-threshold-value").innerHTML = confidenceThreshold;

    if (searchText !== "") {
        const outputData = getFormattedData(searchText, confidenceThreshold);

        for (let key of KEYS) {
            document.getElementById(key).innerHTML = outputData[key];
        }
    } else {
        // Clear form:
        for (let key of KEYS) {
            document.getElementById(key).innerHTML = DEFAULT_MESSAGE;
        }
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
        "answer": MISSING_MESSAGE,
        "explanation": MISSING_MESSAGE,
        "match": MISSING_MESSAGE,
        "confidence": MISSING_MESSAGE
    } : {
        "answer": formatAnswer(bestMatch.data.answer),
        "explanation": bold(bestMatch.data.explanation),
        "match": bold(bestMatch.data.text),
        "confidence": bold(bestMatch.confidence)
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
 * Set up form fields and window data.
 * @date 8/11/2023 - 5:22:45 AM
 *
 * @async
 * @returns {Promise<void>}
 */
async function setup() {
    // Clear form:
    for (let key of KEYS) {
        document.getElementById(key).innerHTML = DEFAULT_MESSAGE;
    }

    const confidenceThreshold = document.getElementById("confidence-threshold").value;
    document.getElementById("confidence-threshold-value").innerHTML = confidenceThreshold;

    window.data = await (await fetch(DATABASE_PATH)).json();
};

setup();
