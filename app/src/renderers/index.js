/**
 * Set the total number of questions in the database to the given tag.
 * @date 3/28/2023 - 6:53:12 PM
 *
 * @async
 * @param {*} tag_id
 * @param {*} db_path
 * @returns {*}
 */
async function setTotalQuestions(tag_id, db_path) {
    const data = await(await fetch(db_path)).json();
    const totalQuestions = document.getElementById(tag_id);

    totalQuestions.innerHTML = Object.keys(data).length;
}

/**
 * Set the total number of answered questions in the database to the given tag.
 * @date 3/28/2023 - 6:53:26 PM
 *
 * @async
 * @param {*} tag_id
 * @param {*} db_path
 * @returns {*}
 */
async function setAnsweredQuestions(tag_id, db_path) {
    const data = await(await fetch(db_path)).json();
    const answeredQuestions = document.getElementById(tag_id);
    let count = 0;

    for (const key in data) {
        if (data[key].answer != '') {
            count++;
        }
    }

    answeredQuestions.innerHTML = count;
}

// Set up dynamic data for the page:
setTotalQuestions('total_questions', 'database.json');
setAnsweredQuestions('answered_questions', 'database.json');
