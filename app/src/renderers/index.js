// Constants:
const TOTAL_QUESTIONS_TAG = "total_questions";
const ANSWERED_QUESTIONS_TAG = "answered_questions";
const DATABASE_PATH = "database.json";

/**
 * Set the total number of questions in the database to the given tag.
 * @date 3/28/2023 - 6:53:12 PM
 *
 * @async
 * @param {string} tag_id - ID of the tag to set the total number of questions to.
 * @param {string} db_path - Path to the database.
 */
async function setTotalQuestions(tag_id, db_path) {
    const data = await (await fetch(db_path)).json();
    const totalQuestions = document.getElementById(tag_id);

    totalQuestions.innerHTML = Object.keys(data).length;
}

/**
 * Set the total number of answered questions in the database to the given tag.
 * @date 3/28/2023 - 6:53:26 PM
 *
 * @async
 * @param {string} tag_id - ID of the tag to set the total number of answered questions to.
 * @param {string} db_path - Path to the database.
 */
async function setAnsweredQuestions(tag_id, db_path) {
    const data = await (await fetch(db_path)).json();
    const answeredQuestions = document.getElementById(tag_id);
    let count = 0;

    for (const key in data) {
        if (data[key].answer != null) {
            count++;
        }
    }

    answeredQuestions.innerHTML = count;
}

// Set up dynamic data for the page:
setTotalQuestions(TOTAL_QUESTIONS_TAG, DATABASE_PATH);
setAnsweredQuestions(ANSWERED_QUESTIONS_TAG, DATABASE_PATH);
