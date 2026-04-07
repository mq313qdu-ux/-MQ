// Database of 35 images
const imageNames = [
    "Thumb (AP view)", "Thumb (Lateral view)", "Thumb (oblique view)", "Hand (PA view)",
    "Hand (PA view)", "Hand (PA view)", "Hand (Lateral view)", "Hand (Lateral view)",
    "Hand (Oblique view)", "Hand (Oblique view)", "Hand (Oblique view)", "Hand (Oblique view)",
    "Hand (Oblique view)", "Scaphoid (PA view)", "Scaphoid (PA with ulnar deviaton view)", "Scaphoid (Lateral view)",
    "Wrist (PA view)", "Wrist (Lateral view)", "Wrist (AP view)", "Wrist (AP view)",
    "Forearm (AP view)", "Forearm (AP view)", "Forearm (Lateral view)", "Forearm (Lateral view)",
    "Galeazzi fracture", "Monteggia fracture", "Humerus (AP view)", "Humerus (AP view)",
    "Humerus (Lateral view)", "Humerus (Lateral view)", "Shoulder (AP view)", "Shoulder (AP view)",
    "Shoulder (Axial view-superior-inferior)", "Shoulder (AP Axial Oblique - Garth Method)", "Shoulder (Lateral scapula view or Y view)"
];

const db = imageNames.map((name, index) => ({
    id: `image${index + 1}`,
    src: `image${index + 1}.jpg`,
    name: name
}));

// DOM Elements
const mainMenu = document.getElementById('main-menu');
const quizScreen = document.getElementById('quiz-screen');
const resultsScreen = document.getElementById('results-screen');
const questionContainer = document.getElementById('question-container');
const controlsContainer = document.getElementById('controls-container');
const nextBtn = document.getElementById('next-btn');

// State Variables
let currentMode = '';
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let mistakes = [];
let totalQ = 35;

// Helper: Shuffle Array
function shuffleArray(array) {
    let newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}

// Start Quiz Function
function startQuiz(mode) {
    currentMode = mode;
    currentQuestionIndex = 0;
    score = 0;
    mistakes = [];
    questions = [];

    // Switch Screens
    mainMenu.classList.remove('active');
    resultsScreen.classList.remove('active');
    quizScreen.classList.add('active');

    generateQuestions(mode);
    
    totalQ = (mode === 'mode3') ? 7 : 35;
    document.getElementById('total-q').textContent = totalQ;
    updateProgress();
    
    loadQuestion();
}

// Prepare Questions Logic
function generateQuestions(mode) {
    let shuffledDb = shuffleArray(db);
    
    if (mode === 'mode1') {
        // Mode 1: 35 images, 4 options each
        questions = shuffledDb.map(item => {
            let options = [item.name];
            while (options.length < 4) {
                let randomName = db[Math.floor(Math.random() * db.length)].name;
                if (!options.includes(randomName)) {
                    options.push(randomName);
                }
            }
            return { item, options: shuffleArray(options) };
        });
    } 
    else if (mode === 'mode2') {
        // Mode 2: 35 images, True/False random statement
        questions = shuffledDb.map(item => {
            let isTrue = Math.random() > 0.5;
            let displayedName = item.name;
            if (!isTrue) {
                let wrongName;
                do {
                    wrongName = db[Math.floor(Math.random() * db.length)].name;
                } while(wrongName === item.name);
                displayedName = wrongName;
            }
            return { item, displayedName, isTrue };
        });
    }
    else if (mode === 'mode3') {
        // Mode 3: 7 rounds, 5 items per round
        questions = [];
        for (let i = 0; i < 7; i++) {
            let roundItems = shuffledDb.slice(i * 5, (i + 1) * 5);
            let uniqueNames = [...new Set(roundItems.map(x => x.name))];
            let roundOptions = shuffleArray(uniqueNames);
            questions.push({ items: roundItems, options: roundOptions });
        }
    }
    else if (mode === 'mode4') {
        // Mode 4: Reverse Mode (Text -> 4 Images)
        questions = shuffledDb.map(item => {
            let options = [item];
            while (options.length < 4) {
                let randomItem = db[Math.floor(Math.random() * db.length)];
                if (!options.some(opt => opt.id === randomItem.id)) {
                    options.push(randomItem);
                }
            }
            return { item, options: shuffleArray(options) };
        });
    }
}

// Render Request
function loadQuestion() {
    questionContainer.innerHTML = '';
    controlsContainer.classList.add('hidden');
    
    // Ensure we don't bleed out of bounds
    if (currentQuestionIndex >= questions.length) {
        showResults();
        return;
    }
    
    let q = questions[currentQuestionIndex];
    
    if (currentMode === 'mode1') {
        let template = document.getElementById('mode1-template').content.cloneNode(true);
        template.querySelector('.question-img').src = q.item.src;
        // Fallback for missing images during testing
        template.querySelector('.question-img').onerror = function() { this.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100%25" height="100%25" viewBox="0 0 800 400"%3E%3Crect fill="%23f1f5f9" width="800" height="400"/%3E%3Ctext fill="%2394a3b8" x="50%25" y="50%25" font-family="sans-serif" font-size="24" text-anchor="middle" dominant-baseline="middle"%3E[صورة غير متوفرة: '+q.item.id+'.jpg]%3C/text%3E%3C/svg%3E'; };
        
        let optionsHolder = template.querySelector('.options-grid');
        
        q.options.forEach(opt => {
            let btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = opt;
            btn.onclick = () => checkMode1(btn, opt, q.item);
            optionsHolder.appendChild(btn);
        });
        questionContainer.appendChild(template);
    }
    else if (currentMode === 'mode2') {
        let template = document.getElementById('mode2-template').content.cloneNode(true);
        let img = template.querySelector('.question-img');
        img.src = q.item.src;
        img.onerror = function() { this.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100%25" height="100%25" viewBox="0 0 800 400"%3E%3Crect fill="%23f1f5f9" width="800" height="400"/%3E%3Ctext fill="%2394a3b8" x="50%25" y="50%25" font-family="sans-serif" font-size="24" text-anchor="middle" dominant-baseline="middle"%3E[صورة غير متوفرة: '+q.item.id+'.jpg]%3C/text%3E%3C/svg%3E'; };
        
        template.querySelector('.statement-text').textContent = q.displayedName;
        questionContainer.appendChild(template);
    }
    else if (currentMode === 'mode3') {
        let template = document.getElementById('mode3-template').content.cloneNode(true);
        let matchGrid = template.querySelector('.match-grid');
        let letters = ['A', 'B', 'C', 'D', 'E'];
        
        q.items.forEach((item, idx) => {
            let matchItem = document.createElement('div');
            matchItem.className = 'match-item';
            
            let imgCont = document.createElement('div');
            imgCont.className = 'match-img-container';
            imgCont.innerHTML = `
                <img src="${item.src}" alt="img" class="match-img" onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100%25\\' height=\\'100%25\\' viewBox=\\'0 0 200 200\\'%3E%3Crect fill=\\'%23f1f5f9\\' width=\\'200\\' height=\\'200\\'/%3E%3Ctext fill=\\'%2394a3b8\\' x=\\'50%25\\' y=\\'50%25\\' font-family=\\'sans-serif\\' font-size=\\'14\\' text-anchor=\\'middle\\' dominant-baseline=\\'middle\\'%3Eصورة مفقودة%3C/text%3E%3C/svg%3E'">
                <div class="match-letter">${letters[idx]}</div>
            `;
            matchItem.appendChild(imgCont);
            
            let select = document.createElement('select');
            select.className = 'match-select';
            select.dataset.correctName = item.name;
            select.dataset.imgSrc = item.src;
            
            let defaultOpt = document.createElement('option');
            defaultOpt.value = "";
            defaultOpt.textContent = "اختر الاسم الصحيح";
            defaultOpt.disabled = true;
            defaultOpt.selected = true;
            select.appendChild(defaultOpt);
            
            q.options.forEach((optName, optIdx) => {
                let opt = document.createElement('option');
                opt.value = optName;
                opt.textContent = `${optIdx + 1}- ${optName}`;
                select.appendChild(opt);
            });
            
            matchItem.appendChild(select);
            matchGrid.appendChild(matchItem);
        });
        questionContainer.appendChild(template);
    }
    else if (currentMode === 'mode4') {
        let template = document.getElementById('mode4-template').content.cloneNode(true);
        template.querySelector('.mode4-title').textContent = q.item.name;
        
        let grid = template.querySelector('.mode4-grid');
        q.options.forEach(optItem => {
            let btn = document.createElement('button');
            btn.className = 'mode4-img-btn';
            
            let img = document.createElement('img');
            img.src = optItem.src;
            img.onerror = function() { this.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 200 200'%3E%3Crect fill='%23f1f5f9' width='200' height='200'/%3E%3Ctext fill='%2394a3b8' x='50%25' y='50%25' font-family='sans-serif' font-size='14' text-anchor='middle' dominant-baseline='middle'%3Eمفقودة%3C/text%3E%3C/svg%3E"; };
            
            btn.appendChild(img);
            btn.onclick = () => checkMode4(btn, optItem, q.item);
            grid.appendChild(btn);
        });
        
        questionContainer.appendChild(template);
    }
    
    updateProgress();
}

// Mode 1 Checker
function checkMode1(btn, selectedName, item) {
    let btns = document.querySelectorAll('.option-btn');
    btns.forEach(b => b.disabled = true); // Disable selection
    
    if (selectedName === item.name) {
        btn.classList.add('correct');
        score += 1;
        setTimeout(() => goNext(), 800); // Auto advance
    } else {
        btn.classList.add('wrong');
        btns.forEach(b => {
             if (b.textContent === item.name) b.classList.add('correct');
        });
        mistakes.push({ img: item.src, correct: item.name, wrong: selectedName });
        
        controlsContainer.classList.remove('hidden');
        nextBtn.onclick = () => goNext();
    }
}

// Mode 2 Checker
function checkMode2(selectedTrue) {
    let q = questions[currentQuestionIndex];
    let isCorrect = (selectedTrue === q.isTrue);
    
    let btns = document.querySelectorAll('.tf-btn');
    btns.forEach(b => b.disabled = true);
    
    if (isCorrect) {
        if(selectedTrue){ document.querySelector('.true-btn').style.opacity = '1'; document.querySelector('.false-btn').style.opacity = '0.5'; }
        else { document.querySelector('.false-btn').style.opacity = '1'; document.querySelector('.true-btn').style.opacity = '0.5'; }
        
        score += 1;
        setTimeout(() => goNext(), 800);
    } else {
        mistakes.push({ 
            img: q.item.src, 
            correct: `الاستنتاج الصحيح: الإجابة هي ${q.isTrue ? '"صح"' : '"خطأ"'} (الاسم الفعلي: ${q.item.name})`, 
            wrong: `اخترت: ${selectedTrue ? 'صح' : 'خطأ'} للاسم (${q.displayedName})` 
        });
        
        if(selectedTrue){ document.querySelector('.true-btn').style.border = '2px solid red'; }
        else { document.querySelector('.false-btn').style.border = '2px solid red'; }

        controlsContainer.classList.remove('hidden');
        nextBtn.onclick = () => goNext();
    }
}

// Mode 3 (Match) Checker
function checkMode3() {
    let selects = document.querySelectorAll('.match-select');
    let allAnswered = Array.from(selects).every(s => s.value !== "");
    
    if (!allAnswered) {
        alert("يرجى اختيار اسم لكل صورة قبل تقييم النموذج.");
        return;
    }
    
    let allCorrect = true;
    let roundScore = 0;
    
    selects.forEach(s => {
        s.disabled = true;
        if (s.value === s.dataset.correctName) {
            s.classList.add('correct-match');
            roundScore += 1; // Count each individual matched photo
        } else {
            s.classList.add('wrong-match');
            allCorrect = false;
            mistakes.push({
                img: s.dataset.imgSrc,
                correct: s.dataset.correctName,
                wrong: s.value
            });
        }
    });
    
    score += roundScore;
    document.getElementById('submit-match-btn').disabled = true;
    
    if (allCorrect) {
        setTimeout(() => goNext(), 1500); // Auto-advance for matching too
    } else {
        controlsContainer.classList.remove('hidden');
        nextBtn.onclick = () => goNext();
    }
}

// Mode 4 Checker
function checkMode4(btn, selectedItem, correctItem) {
    let btns = document.querySelectorAll('.mode4-img-btn');
    btns.forEach(b => b.disabled = true);
    
    if (selectedItem.id === correctItem.id) {
        btn.classList.add('correct');
        score += 1;
        setTimeout(() => goNext(), 800);
    } else {
        btn.classList.add('wrong');
        
        // Highlight correct image
        let currentQ = questions[currentQuestionIndex];
        btns.forEach((b, idx) => {
             if (currentQ.options[idx].id === correctItem.id) {
                 b.classList.add('correct');
             }
        });
        
        mistakes.push({
            img: correctItem.src,
            correct: `هذه هي الصورة الصحيحة لـ ${correctItem.name}`,
            wrong: `الصورة التي اخترتها خاطئة`
        });
        
        controlsContainer.classList.remove('hidden');
        nextBtn.onclick = () => goNext();
    }
}

// Progression
function goNext() {
    currentQuestionIndex++;
    if (currentQuestionIndex < totalQ) {
        loadQuestion();
    } else {
        showResults();
    }
}

function updateProgress() {
    // Current number is safe-guarded to not exceed total
    let currentDisplay = Math.min(currentQuestionIndex + 1, totalQ);
    document.getElementById('current-q').textContent = currentDisplay;
    
    let percent = ((currentQuestionIndex) / totalQ) * 100;
    document.getElementById('progress-fill').style.width = percent + '%';
    document.getElementById('score-val').textContent = score;
}

// Display Summary
function showResults() {
    quizScreen.classList.remove('active');
    resultsScreen.classList.add('active');
    
    let max = (currentMode === 'mode3') ? 35 : 35;
    document.getElementById('final-score-val').textContent = score;
    document.getElementById('final-total').textContent = max;
    
    let mistakesList = document.getElementById('mistakes-list');
    mistakesList.innerHTML = '';
    
    if (mistakes.length === 0) {
        mistakesList.innerHTML = '<p style="text-align:center; color:#10b981; font-weight:bold; font-size:1.2rem; padding: 20px;">أحسنت بطل! إجاباتك كلها صحيحة 👏</p>';
    } else {
        mistakes.forEach(m => {
            mistakesList.innerHTML += `
                <div class="mistake-item">
                    <div class="mistake-img-wrapper">
                        <img src="${m.img}" alt="img" onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100%25\\' height=\\'100%25\\' viewBox=\\'0 0 100 100\\'%3E%3Crect fill=\\'%23f1f5f9\\' width=\\'100\\' height=\\'100\\'/%3E%3Ctext fill=\\'%2394a3b8\\' x=\\'50%25\\' y=\\'50%25\\' font-family=\\'sans-serif\\' font-size=\\'12\\' text-anchor=\\'middle\\' dominant-baseline=\\'middle\\'%3Eمفقودة%3C/text%3E%3C/svg%3E'">
                    </div>
                    <div class="mistake-details">
                        <p class="wrong-text">الخطأ: ${m.wrong}</p>
                        <p class="correct-text">الصواب: ${m.correct}</p>
                    </div>
                </div>
            `;
        });
    }
}

// Navigation back to menu
function returnToMenu() {
    quizScreen.classList.remove('active');
    resultsScreen.classList.remove('active');
    mainMenu.classList.add('active');
}
