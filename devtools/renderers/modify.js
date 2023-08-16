const KEYS = ["answer", "explanation", "match", "confidence"];
const DEFAULT_MESSAGE = "Introduce tu búsqueda para procesar resultados";

// Status variables:

let lastInput = null;
let lastMatch = null;
let submitted = false;

// Data processing functions:

/**
 * Get results from input data.
 * @date 8/12/2023 - 3:46:49 AM
 */
function getResults() {
    const text = document.getElementById("input").value;

    if (text !== "") {
        // Format data:
        const outputData = getFormattedData(text, 0);
        outputData.explanation = outputData.explanation === MISSING_MESSAGE ? "" : outputData.explanation.trim();

        // Update field contents:
        for (let key of KEYS) {
            if (key === "answer") {
                document.getElementById(unBold(outputData.answer) == "Verdadero" ? "true" : "false").checked = true;
            } else if (["explanation", "match"].includes(key)) {
                document.getElementById(key).value = unBold(outputData[key]);
            } else {
                document.getElementById(key).innerHTML = unBold(outputData[key]);
            }
        }

        lastMatch = unBold(outputData.match);
    } else {
        resetView();
    }

    lastInput = text;
}

/**
 * Update `window.data`.
 * @date 8/13/2023 - 5:20:04 AM
 */
function processData() {
    if (lastMatch !== null) {
        // Format and structure data:
        const text = document.getElementById("match").value.trim();
        let explanation = document.getElementById("explanation").value.trim();
        explanation = explanation === "" ? null : explanation;
        const data = {
            "answer": document.getElementById("true").checked,
            "explanation": explanation,
        };

        // Replace data:
        const index = Object.keys(window.data).find(key => key === lastMatch);
        if (index !== undefined) {
            delete window.data[index];
            window.data[text] = data;
        }

        submitted = true;
        resetView();
    } else {
        alert("No se pueden procesar datos sin realizar una búsqueda.\n\nModifica cualquier entrada e inténtalo de nuevo.");
    }
}

/**
 * Copy `window.data` to clipboard.
 * @date 8/13/2023 - 5:11:07 AM
 */
function copyData() {
    if (submitted) {
        navigator.clipboard.writeText(JSON.stringify(window.data, null, 4));
        alert("Los nuevos datos JSON han sido copiados al portapapeles.\n\nReemplaza los datos de la base de datos con los nuevos datos copiados.")
        setTimeout(() => window.location.reload(), 1000);
    } else {
        alert("No se pueden copiar datos sin cambios.\n\nModifica cualquier entrada, procesa los cambios e inténtalo de nuevo.")
    }
}

// Auxiliary functions:

/**
 * Reset input data.
 * @date 8/13/2023 - 5:12:04 AM
 */
function resetView() {
    // Clear form (tag name sensitive):
    for (let key of KEYS) {
        if (document.getElementById(key).tagName === "INPUT") {
            document.getElementById(key).placeholder = DEFAULT_MESSAGE;
        } else if (document.getElementById(key).tagName === "FORM") {
            document.getElementById(key).reset();
        } else {
            document.getElementById(key).innerHTML = DEFAULT_MESSAGE;
        }
    }

    // Clear input:
    document.getElementById("input").value = "";

    // Reset status variables:
    lastInput = null;
    lastMatch = null;
}

/**
 * Remove bold tags from text.
 * @date 8/13/2023 - 5:21:26 AM
 *
 * @param {string} text - Input text.
 * @returns {string} - Text without bold tags.
 */
function unBold(text) {
    return text.replace(/<b>/g, "").replace(/<\/b>/g, "");
}

// Main function:

(() => {
    resetView();
    setup();
})();
