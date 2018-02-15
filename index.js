
function setGoals(period, goals) {
  const ol = document.getElementById(`${period}GoalList`);
  goals.forEach( goal => {
    const li = document.createElement("li");
    li.classList.add('goal-item');
    li.innerHTML = goals;
    ol.prepend(li);
  });
}

function getGoals(period) {
  return new Promise(resolve => {
    chrome.storage.sync.get(period, (goals) => {
      if(!goals[period]) {
        resolve(goals = {});
      } else {
        console.log('get goals: ', goals);
        resolve(goals);
      }
    });
  });
}

async function saveGoal(period, value) {

  let goals = await getGoals(period);
  console.log('prepush: ', goals);
  goals[period].push(value);
  console.log('postpush: ', goals);
  
  chrome.storage.sync.set(goals, () => {
    console.log('goal saved');
  });
}

const dailyGoalInput = document.getElementById('dailyGoal');

dailyGoalInput.addEventListener('change', () => { 
  const d = 'daily';
  saveGoal(d , dailyGoalInput.value); 
});

