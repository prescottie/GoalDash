
function setGoals(period, goals) { 
  if(!goals[period]) {
    return false;
  } else {
    const ol = document.getElementById(`${period}GoalList`);
    while(ol.firstChild) {
      ol.removeChild(ol.firstChild);
    }
    goals[period].forEach(goal => {
      const li = document.createElement("li");
      const div = document.createElement('div');
      const input = document.createElement('input');
      // const label = document.createElement('label');
      const xButton = document.createElement('button');
      const checkbox = document.createElement('span');
      checkbox.addEventListener('click', () => {
        console.log('check clicked');
        
        let checkContent= checkbox.getAttribute('content');
        let c = window.getComputedStyle(checkbox, null).getPropertyValue('content');
        console.log(c);
        
          if(c === "url(\"chrome-extension://dbcfhoepgbiiaeecfojpjeopdonfdppf/uncheck-circle.svg\")") {
            checkbox.style.content = "url(\"chrome-extension://dbcfhoepgbiiaeecfojpjeopdonfdppf/check-filled.svg\")";
          } else if(c === "url(\"chrome-extension://dbcfhoepgbiiaeecfojpjeopdonfdppf/check-filled.svg\")") {
            checkbox.style.content = "url(\"chrome-extension://dbcfhoepgbiiaeecfojpjeopdonfdppf/uncheck-circle.svg\")";
          } else {
            console.log('checkmark error');
          }
      });
      input.setAttribute('type', 'text');
      input.setAttribute('disabled', 'disabled');
      input.value = goal;
      xButton.setAttribute('data-period', period);
      xButton.setAttribute('data-goal', goal);
      input.classList.add('goal-input');
      li.classList.add('goal-item');
      div.classList.add('goal-div');
      checkbox.classList.add('checkbox');
      xButton.classList.add('x-btn');
      xButton.innerHTML = '&#10005';
      li.append(div);
      div.append(input);
      div.append(checkbox);
      div.append(xButton);
      ol.prepend(li);
    });
    let x = document.getElementsByClassName('x-btn');
    for(let i= 0; i < x.length; i++) {
      x[i].addEventListener('click', () => {
        let period = window.event.target.getAttribute('data-period');
        let goal = window.event.target.getAttribute('data-goal');
        console.log(period);
        console.log(goal);
        removeGoal(period, goal)
      });
    }
  }
}

function getGoals(period) {
  return new Promise(resolve => {
    chrome.storage.sync.get(period, (goals) => {
      if(!goals[period]) {
        resolve(goals = {});
      } else {
        resolve(goals);
      }
    });
  });
}

async function saveGoal(period, value) {
  let goals = await getGoals(period);
  if(!goals[period]) {
    goals[period] = [];
    goals[period].push(value);
  } else {
    goals[period].push(value);
  }
  chrome.storage.sync.set(goals, () => {
    console.log('goal saved');
  });
  setGoals(period, goals);
}

async function removeGoal(period, value) {
  let goals = await getGoals(period);
  let index = goals[period].indexOf(value);
  if(index > -1) {
    goals[period].splice(index, 1);
  }
  console.log(goals);
  chrome.storage.sync.set(goals, () => {
    console.log('goal removed');
  });
  setGoals(period, goals);
}

async function initGoals() {
  let daily = await getGoals('daily');
  let weekly = await getGoals('weekly');
  let yearly = await getGoals('yearly');

  setGoals('daily', daily);
  setGoals('weekly', weekly);
  setGoals('yearly', yearly);
}

const dailyGoalInput = document.getElementById('dailyGoal');
dailyGoalInput.addEventListener('change', () => { 
  saveGoal('daily' , dailyGoalInput.value);
  dailyGoalInput.value = '';
});

const weeklyGoalInput = document.getElementById('weeklyGoal');
weeklyGoalInput.addEventListener('change', () => { 
  saveGoal('weekly' , weeklyGoalInput.value); 
  weeklyGoalInput.value = '';
});

const yearlyGoalInput = document.getElementById('yearlyGoal');
yearlyGoalInput.addEventListener('change', () => { 
  saveGoal('yearly' , yearlyGoalInput.value); 
  yearlyGoalInput.value = '';
});

document.addEventListener('DOMContentLoaded', () => {
  initGoals();
});