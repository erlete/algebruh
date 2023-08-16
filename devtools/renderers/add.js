const KEYS = ["answer", "explanation"];
const DEFAULT_MESSAGE = "Introduce los datos de la pregunta para continuar";

// Status variables:

let lastInput = null;
let submitted = false;

// Data processing functions:

/**
 * Update `window.data`.
 * @date 8/13/2023 - 5:20:04 AM
 */
function processData() {
    const text = document.getElementById("input").value.trim();
    const isAnswered = document.getElementById("true").checked || document.getElementById("false").checked;

    if (text !== "" && isAnswered) {
        // Format and structure data:
        let explanation = document.getElementById("explanation").value.trim();
        explanation = explanation === "" ? null : explanation;
        const data = {
            "answer": document.getElementById("true").checked,
            "explanation": explanation,
        };

        // Add data:
        window.data[text] = data;

        submitted = true;
        resetView();
    } else {
        alert("Para procesar los datos, debes introducir el enunciado de la pregunta y marcar su respuesta (la explicación es opcional).");
    }
}

/**
 * Copy `window.data` to clipboard.
 * @date 8/13/2023 - 5:11:07 AM
 */
function copyData() {
    if (submitted) {
        alert("Los nuevos datos JSON han sido copiados al portapapeles.\n\nReemplaza los datos de la base de datos con los nuevos datos copiados.")
        navigator.clipboard.writeText(JSON.stringify(window.data, null, 4));
        setTimeout(() => window.location.reload(), 1000);
    } else {
        alert("No se pueden copiar datos sin cambios.\n\nAñade una pregunta, procesa los cambios e inténtalo de nuevo.")
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
