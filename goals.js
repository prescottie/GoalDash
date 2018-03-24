import {timeSince, toggleClass, startTime, checkTime, updateTabUrl} from './helpers.js';

export function setGoals(period, goals) { 
  if(!goals[period]) {
    return false;
  } else {
    const ol = document.getElementById(`${period}GoalList`);
    while(ol.firstChild) {
      ol.removeChild(ol.firstChild);
    }
    goals[period].forEach((goal,i) => {
      const li = document.createElement("li");
      const div = document.createElement('div');
      const span = document.createElement('span');
      const goalTime = document.createElement('time');
      const xButton = document.createElement('button');
      const checkbox = document.createElement('span');
      checkbox.addEventListener('click', () => {
        getGoals(period).then(goals => goals);
        goals[period][i].status === "active" ? goals[period][i].status = "completed": goals[period][i].status = "false";
        chrome.storage.sync.set(goals, () => {
          console.log('goal updated');
        });
        goals[period][i].status === "completed" ? toggleClass(checkbox, 'unchecked', 'checked') : toggleClass(checkbox, 'checked', 'unchecked');
      });

      goal.status === "completed" ? toggleClass(checkbox, 'unchecked', 'checked') : toggleClass(checkbox, 'checked', 'unchecked');
      span.innerHTML = goal.value;
      goalTime.innerHTML = timeSince(goal.date);
      xButton.setAttribute('data-period', period);
      xButton.setAttribute('data-goal', goal.value);
      span.classList.add('goal-span');
      li.classList.add('goal-item');
      div.classList.add('goal-div');
      goalTime.classList.add('goal-timestamp');
      checkbox.classList.add('checkbox');
      xButton.classList.add('x-btn');
      xButton.innerHTML = '&#10005';
      goalExpired(goal, period, goalTime);
      li.append(div);
      div.append(span);
      div.append(goalTime);
      div.prepend(checkbox);
      div.append(xButton);
      ol.prepend(li);
      span.addEventListener('dblclick', (eDbl) => {
        eDbl.target.setAttribute('contenteditable', 'true');
        eDbl.target.focus();
        eDbl.target.addEventListener('keypress', (enter) => {
          if(enter.keyCode === 13) {
            enter.target.blur();
            enter.target.setAttribute('contenteditable', 'false');
          }
        });
        eDbl.target.addEventListener('blur', (eBlur) => {
          editGoals(xButton.getAttribute('data-period'), xButton.getAttribute('data-goal'), eBlur.target.innerHTML);
        });
      });
    });
    let x = document.getElementsByClassName('x-btn');
    for(let i= 0; i < x.length; i++) {
      x[i].addEventListener('click', () => {
        let period = window.event.target.getAttribute('data-period');
        let goal = window.event.target.getAttribute('data-goal');
        removeGoal(period, goal);
      });
    }
  }
}

export function getGoals(period) {
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

export async function editGoals(period, prevValue, nextValue) {
  let goals = await getGoals(period);
  let index = goals[period].findIndex(g => g.value === prevValue);
  if(!goals[period]) {
    console.error('error finding goal', prevValue)
  } else {
    goals[period][index].value = nextValue;
    chrome.storage.sync.set(goals, () => {
      console.log('goal updated');
    });
  }
  setGoals(period, goals);
}

export async function saveGoal(period, value) {
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
  console.log('set goal', goals);
  
  setGoals(period, goals);
}

export async function removeGoal(period, value) {
  let goals = await getGoals(period);
  let index = goals[period].findIndex(g => g.value === value);
  if(index > -1) {
    goals[period].splice(index, 1);
  }
  chrome.storage.sync.set(goals, () => {
    console.log('goal removed');
  });
  setGoals(period, goals);
}

export function getStarted() {
  console.log('get started');
    let gSection = document.getElementsByClassName('goal-section');
    for(let i = 0; i < gSection.length; i++) {
      gSection[i].classList.add('hidden');
    }
    const yearStart = document.getElementById('startYear');
    const weekStart = document.getElementById('startWeek');
    const dayStart = document.getElementById('startDay');
    yearStart.classList.remove('hidden');
    const yearStartInput = document.getElementById('yearStartInput');
    const weekStartInput = document.getElementById('weekStartInput');
    const dayStartInput = document.getElementById('dayStartInput');
    yearStartInput.addEventListener('change', () => {
      saveGoal('yearly' , {status: "active", date: Date.now(), value: yearStartInput.value}); 
      yearStart.classList.add('hidden');
      weekStart.classList.remove('hidden');
    });
    weekStartInput.addEventListener('change', () => {
      saveGoal('weekly' , {status: "active", date: Date.now(), value: weekStartInput.value});
      weekStart.classList.add('hidden');
      dayStart.classList.remove('hidden');
    });
    dayStartInput.addEventListener('change', () => {
      saveGoal('daily' , {status: "active", date: Date.now(), value: dayStartInput.value});
      dayStart.classList.add('hidden');
      for(let i = 0; i < gSection.length; i++) {
        gSection[i].classList.remove('hidden');
      }
      document.getElementById('getHelp').classList.add('hidden');
    }); 
}

export async function initGoals() {
  let daily = await getGoals('daily');
  let weekly = await getGoals('weekly');
  let yearly = await getGoals('yearly');
  
  setGoals('daily', daily);
  setGoals('weekly', weekly);
  setGoals('yearly', yearly);

}

function goalExpired(goal, period, elm) {
  switch(period) {
    case "daily":
      if(Date.now() - goal.date > 86400000) {
        elm.style.color = "#FF434C90";
      } 
      break;
    case "weekly":
      if(Date.now() - goal.date > 604800000) {
        elm.style.color = "#FF434C90";
      } 
      break;
    case "yearly":
      if(Date.now() - goal.date > 31536000000) {
        elm.style.color = "#FF434C90";
      } 
      break;
    default:
      console.log('Expiration date not found');
  }
}