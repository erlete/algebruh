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

let lastInput = null;

/**
 * Update the form on new inputs.
 * @date 8/11/2023 - 3:07:19 AM
 */
function updateForm() {
    const searchText = document.getElementById("search-text").value;
    lastInput = searchText;
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

function resetView() {
    // Clear form:
    for (let key of KEYS) {
        document.getElementById(key).innerHTML = DEFAULT_MESSAGE;
    }

    // Set dynamic range input value:
    const confidenceThreshold = document.getElementById("confidence-threshold").value;
    document.getElementById("confidence-threshold-value").innerHTML = confidenceThreshold;
}

/**
 * Set up form fields and window data.
 * @date 8/11/2023 - 5:22:45 AM
 *
 * @async
 * @returns {Promise<void>}
 */
async function setup() {
    resetView();
    window.data = await (await fetch(DATABASE_PATH)).json();
};

setup();
