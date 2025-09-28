// Black Force 007 Quiz Engine with all advanced features
const QUESTION_TIME = 15; // seconds, can be 30
let questions = [];
let currentQuestion = 0;
let timerInterval;
let timeLeft = 0;
let score = 0;
let correctCount = 0;
let wrongCount = 0;
let streak = 0;
let maxStreak = 0;
let usedIndexes = [];
let userName = "Player";
let leaderboard = JSON.parse(localStorage.getItem("bf007_leaderboard") || "[]");
let achievements = [];

function shuffleArray(arr) {
    let n = arr.length, t, i;
    while (n) {
        i = Math.floor(Math.random() * n--);
        t = arr[n];
        arr[n] = arr[i];
        arr[i] = t;
    }
    return arr;
}

function pickQuestions() {
    // Ensure questions are not repeated & shuffled
    let indexes = Array.from({length: window.quizQuestions.length}, (_, i) => i);
    shuffleArray(indexes);
    usedIndexes = indexes.slice(0, 10); // 10 প্রশ্ন প্রতি রাউন্ডে
    questions = usedIndexes.map(i => window.quizQuestions[i]);
}
function displayQuestion() {
    clearInterval(timerInterval);
    if (currentQuestion >= questions.length) {
        showResult();
        return;
    }
    const q = questions[currentQuestion];
    document.getElementById("feedback").innerHTML = "";
    document.getElementById("feedback").className = "";
    document.getElementById("question").textContent = `${currentQuestion + 1}. ${q.q}`;
    // Shuffle options every time!
    let optIndexes = [0,1,2,3];
    shuffleArray(optIndexes);
    let optionsHTML = optIndexes.map(idx =>
        `<button class="option-btn" data-idx="${idx}">${q.options[idx]}</button>`
    ).join("");
    document.getElementById("options").innerHTML = optionsHTML;
    Array.from(document.getElementsByClassName("option-btn")).forEach(btn => {
        btn.onclick = () => handleAnswer(parseInt(btn.dataset.idx), optIndexes);
    });
    document.getElementById("score").textContent =
        `পয়েন্ট: ${score} | ✔️ ${correctCount} ❌ ${wrongCount}`;
    startTimer();
}
function startTimer() {
    timeLeft = QUESTION_TIME;
    document.getElementById("timer").textContent = `⏳ ${timeLeft}s`;
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById("timer").textContent = `⏳ ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleAnswer(-1);
        }
    }, 1000);
}
function handleAnswer(selectedIdx, shuffledOpts) {
    clearInterval(timerInterval);
    const q = questions[currentQuestion];
    // Find the original index for answer
    let correctOpt = shuffledOpts ? shuffledOpts.indexOf(q.answer) : q.answer;
    let isCorrect = selectedIdx === correctOpt;
    let feedbackEl = document.getElementById("feedback");
    Array.from(document.getElementsByClassName("option-btn")).forEach((btn, i) => {
        btn.classList.add("disabled");
        if (i === correctOpt) btn.classList.add("correct");
        if (i === selectedIdx && !isCorrect) btn.classList.add("wrong");
    });
    if (isCorrect) {
        let base = 10, bonus = Math.ceil(timeLeft/2), streakBonus = streak * 2;
        let pts = base + bonus + streakBonus;
        score += pts;
        correctCount++;
        streak++;
        maxStreak = Math.max(maxStreak, streak);
        feedbackEl.textContent = `✅ সঠিক! +${base} বেস, +${bonus} সময়, +${streakBonus} স্ট্রীক`;
        feedbackEl.className = "correct";
        unlockAchievement('correct');
        if (streak >= 3) unlockAchievement('streak3');
    } else {
        feedbackEl.textContent = selectedIdx === -1 ? "⏰ সময় শেষ! ভুল উত্তর।" : "❌ ভুল!";
        feedbackEl.className = "wrong";
        wrongCount++;
        streak = 0;
        unlockAchievement('wrong');
    }
    setTimeout(() => {
        currentQuestion++;
        displayQuestion();
    }, 1300);
}
function showResult() {
    document.getElementById("question-section").classList.add("hidden");
    document.getElementById("result-section").classList.remove("hidden");
    document.getElementById("final-score").textContent =
        `আপনার স্কোর: ${score} পয়েন্ট`;
    document.getElementById("final-details").textContent =
        `সঠিক: ${correctCount}, ভুল: ${wrongCount}, সর্বোচ্চ স্ট্রীক: ${maxStreak}`;
    updateLeaderboard();
    showAchievements();
}
function restartQuiz() {
    score = 0; correctCount = 0; wrongCount = 0; streak = 0; maxStreak = 0;
    currentQuestion = 0; achievements = [];
    document.getElementById("result-section").classList.add("hidden");
    document.getElementById("question-section").classList.remove("hidden");
    pickQuestions();
    displayQuestion();
}
function updateLeaderboard() {
    // Store new score
    leaderboard.push({
        name: userName,
        score: score,
        correct: correctCount,
        date: new Date().toISOString()
    });
    // Sort & keep top 10
    leaderboard = leaderboard.sort((a, b) => b.score - a.score).slice(0, 10);
    localStorage.setItem("bf007_leaderboard", JSON.stringify(leaderboard));
    renderLeaderboard();
}
function renderLeaderboard() {
    const el = document.getElementById("leaderboard");
    el.innerHTML = "";
    leaderboard.forEach((item, i) => {
        let cls = i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "";
        el.innerHTML += `<li class="${cls}">${item.name} - ${item.score} পয়েন্ট (${item.correct}✔️)</li>`;
    });
}
function unlockAchievement(type) {
    if (type === 'correct' && !achievements.includes('correct')) {
        achievements.push('correct');
    }
    if (type === 'wrong' && !achievements.includes('wrong')) {
        achievements.push('wrong');
    }
    if (type === 'streak3' && !achievements.includes('streak3')) {
        achievements.push('streak3');
    }
}
function showAchievements() {
    let el = document.getElementById("achievements");
    let html = "";
    if (achievements.includes('correct'))
        html += `<span class="achievement">🎉 প্রথম সঠিক উত্তর</span>`;
    if (achievements.includes('wrong'))
        html += `<span class="achievement">💡 ভুল থেকেও শেখা</span>`;
    if (achievements.includes('streak3'))
        html += `<span class="achievement">🔥 ৩টি সঠিক স্ট্রীক!</span>`;
    el.innerHTML = html || "কোনো অ্যাচিভমেন্ট নেই";
}
// Initialization
window.onload = function() {
    userName = prompt("আপনার নাম লিখুন (লিডারবোর্ডের জন্য):", "Player") || "Player";
    pickQuestions();
    renderLeaderboard();
    displayQuestion();
    showAchievements();
};
