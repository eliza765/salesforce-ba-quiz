const STORAGE_KEY='salesforceBAQuizProgressV1';
let current=0,correct=0,wrongAttempts=0,answered=new Set();
const jumpEl=document.querySelector('#jumpTo'),jumpButton=document.querySelector('#jumpButton');
function buildJump(){jumpEl.innerHTML='';questions.forEach((q,i)=>{const op=document.createElement('option');op.value=i;op.textContent=`Question ${i+1}${answered.has(i)?' ✓':''}`;jumpEl.appendChild(op)});}
function updateJump(){jumpEl.value=current;[...jumpEl.options].forEach((op,i)=>op.textContent=`Question ${i+1}${answered.has(i)?' ✓':''}`);}
function jumpToSelectedQuestion(){current=Number(jumpEl.value);render();}
jumpEl.onchange=jumpToSelectedQuestion;
jumpButton.onclick=jumpToSelectedQuestion;
const qEl=document.querySelector('#question'),oEl=document.querySelector('#options'),fEl=document.querySelector('#feedback'),eEl=document.querySelector('#explanation'),nEl=document.querySelector('#next'),pEl=document.querySelector('#prev');
function updateSavedStatus(savedAt){
 const el=document.querySelector('#savedStatus');
 if(!el) return;
 const d=savedAt?new Date(savedAt):new Date();
 el.innerHTML=`<strong>✓ Progress saved</strong><span>Saved at ${d.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})} on this device</span>`;
}
function save(){
 const savedAt=new Date().toISOString();
 localStorage.setItem(STORAGE_KEY,JSON.stringify({current,correct,wrongAttempts,answered:[...answered],questions,savedAt}));
 updateSavedStatus(savedAt);
}
function updateStats(){const completed=answered.size, skipped=questions.length-completed;const accuracy=completed?Math.round((correct/(correct+wrongAttempts))*100):0;document.querySelector('#accuracy').textContent=accuracy+'%';document.querySelector('#completed').textContent=`${completed} of ${questions.length} completed`;document.querySelector('#correctCount').textContent=correct;document.querySelector('#incorrectCount').textContent=wrongAttempts;document.querySelector('#skippedCount').textContent=skipped;}
function clearSave(){localStorage.removeItem(STORAGE_KEY);}
function splitEmbeddedExplanation(text){
 if(!text || !text.startsWith('Explanation:')) return {question:text, explanation:''};
 const markers=['What ','Which ','How ','When ','Where ','Why ','Who ','In which ','A business analyst ','Northern Trail ','Cloud Kicks ','Universal Containers ','A Salesforce ','An organization ','During ','After ','Before ','The business analyst '];
 let cut=-1;
 for(const marker of markers){const i=text.lastIndexOf(marker); if(i>20) cut=Math.max(cut,i);}
 if(cut<0){const qmark=text.lastIndexOf('?'); const before=text.slice(0,qmark); cut=before.lastIndexOf('. ')+2;}
 return {explanation:text.slice('Explanation:'.length,cut).trim(),question:text.slice(cut).trim()};
}
function render(){updateStats();updateJump();const q=questions[current];const cleaned=splitEmbeddedExplanation(q.question);qEl.textContent=cleaned.question;oEl.innerHTML='';fEl.textContent='';fEl.className='feedback';eEl.className='explanation hidden';eEl.innerHTML='';nEl.disabled=!answered.has(current);pEl.disabled=current===0;document.querySelector('#progress').textContent=`Question ${current+1} of ${questions.length}`;document.querySelector('#score').textContent=`Score: ${correct} / ${questions.length} (${Math.round((correct/questions.length)*100)}%)`;updateStats();document.querySelector('#bar').style.width=`${((current+1)/questions.length)*100}%`;q.options.forEach((x,i)=>{const b=document.createElement('button');b.className='option';b.textContent=`${String.fromCharCode(65+i)}. ${x}`;b.onclick=()=>answer(i,b);oEl.appendChild(b)});if(answered.has(current)){[...oEl.children].forEach(x=>x.disabled=true);fEl.textContent='Correct! 🎉 Great job!';fEl.className='feedback good';if(q.explanation){eEl.innerHTML='<strong>Explanation</strong><br>'+q.explanation;eEl.className='explanation'}}save();}
function answer(i,b){const q=questions[current];const cleaned=splitEmbeddedExplanation(q.question);if(i===q.correctAnswer){if(!answered.has(current)){correct++;answered.add(current)}[...oEl.children].forEach(x=>x.disabled=true);b.classList.add('correct');fEl.textContent='Correct! 🎉 Great job!';fEl.className='feedback good';const explanationText=q.explanation||cleaned.explanation;if(explanationText){eEl.innerHTML='<strong>Explanation</strong><br>'+explanationText;eEl.className='explanation'}nEl.disabled=false;document.querySelector('#score').textContent=`Score: ${correct} / ${questions.length} (${Math.round((correct/questions.length)*100)}%)`;updateStats();save()}else{wrongAttempts++;updateStats();save();b.classList.add('wrong');fEl.textContent='Not quite — that’s okay. Try again! 😊';fEl.className='feedback try';setTimeout(()=>b.classList.remove('wrong'),700)}}
nEl.onclick=()=>{if(current<questions.length-1){current++;render()}else{fEl.innerHTML=`<strong>🎉 Quiz complete!</strong><br>Your final score is <strong>${correct} / ${questions.length} points (${Math.round((correct/questions.length)*100)}%)</strong>.`;
fEl.className='feedback good final-score';nEl.disabled=true;save()}};
pEl.onclick=()=>{if(current>0){current--;render()}};
function reset(){current=0;correct=0;wrongAttempts=0;answered=new Set();clearSave();render()}
document.querySelector('#restart').onclick=()=>{if(confirm('Start over? Your saved progress will be cleared.')) reset();};
document.querySelector('#shuffle').onclick=()=>{for(let i=questions.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[questions[i],questions[j]]=[questions[j],questions[i]]}current=0;correct=0;wrongAttempts=0;answered=new Set();save();render();fEl.textContent='Questions shuffled! 🔀';fEl.className='feedback good'};
const saved=localStorage.getItem(STORAGE_KEY);
if(saved){try{const s=JSON.parse(saved);if(Array.isArray(s.questions)&&s.questions.length){questions.splice(0,questions.length,...s.questions);current=Math.min(s.current||0,questions.length-1);correct=s.correct||0;wrongAttempts=s.wrongAttempts||0;answered=new Set(s.answered||[]);updateSavedStatus(s.savedAt);buildJump();document.querySelector('#resumeModal').classList.remove('hidden');}else {buildJump();render();}}catch(e){clearSave();render();}}else {buildJump();render();}
document.querySelector('#continue').onclick=()=>{document.querySelector('#resumeModal').classList.add('hidden');buildJump();render();};
document.querySelector('#startOver').onclick=()=>{document.querySelector('#resumeModal').classList.add('hidden');reset();};
