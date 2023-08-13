const fs = require("fs");

const DATABASE_PATH = "../src/databases/questions.json";

/**
 * Remove duplicate entries from the database.
 * @date 8/13/2023 - 1:56:03 PM
 */
function removeDuplicates() {
    const data = JSON.parse(fs.readFileSync(DATABASE_PATH));
    const newData = {};

    for (let entry of Object.keys(data)) {
        if (!Object.keys(newData).includes(entry)) {
            newData[entry] = data[entry];
        } else {
            console.log(`Ignoring "${entry}" since it is repeated.`)
        }
    }

    console.log("[LOG] Successfully removed duplicates")
    console.log(`[LOG] Original count: ${Object.keys(data).length}`)
    console.log(`[LOG] New count: ${Object.keys(newData).length}`)
}

removeDuplicates();
