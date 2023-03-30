// Constants:
const TOTAL_QUESTIONS_TAG = "total_questions";
const ANSWERED_QUESTIONS_TAG = "answered_questions";
const GUARANTEED_GRADE_TAG = "guaranteed_grade";
const DATABASE_PATH = "databases/questions.json";

/**
 * Set up dynamic elements in the index page.
 * @date 3/30/2023 - 1:00:43 PM
 *
 * @async
 * @returns {*}
 */
async function setup() {
    /// Target tags:
    const totalQuestionsTag = document.getElementById(TOTAL_QUESTIONS_TAG);
    const answeredQuestionsTag = document.getElementById(ANSWERED_QUESTIONS_TAG);
    const gradePercentageTag = document.getElementById(GUARANTEED_GRADE_TAG);

    // Fetch data from the database:
    data = await (await fetch(DATABASE_PATH)).json();

    // Set up tag content:
    const totalQuestions = Object.keys(data).length;
    let answeredQuestions = 0;

    for (const key in data) {
        if (data[key].answer != null) {
            answeredQuestions++;
        }
    }

    totalQuestionsTag.innerHTML = totalQuestions;
    answeredQuestionsTag.innerHTML = answeredQuestions;
    gradePercentageTag.innerHTML = (answeredQuestions / totalQuestions) * 100;
    gradePercentageTag.innerHTML = Math.round(gradePercentageTag.innerHTML * 100) / 100;
}

// Run setup script:
setup();
