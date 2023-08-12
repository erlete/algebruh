const KEYS = ["answer", "explanation", "match", "confidence"];
const DEFAULT_MESSAGE = "Introduce tu búsqueda para procesar resultados";
const MISSING_MESSAGE = "No se ha encontrado ningún resultado viable";

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

setup();
