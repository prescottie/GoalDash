import {timeSince, toggleClass, startTime, checkTime, updateTabUrl, fadeOut} from './helpers.js';
import {saveGoal, editGoals, removeGoal, getGoals, setGoals, getCurrentSelectedGoals, initGoals} from './goals.js';
import {initQuote} from './quote.js';
import {getLocation} from './weather.js';
import {getLinks, addLink, initLinks, removeLink, makeLinksClickable} from './links.js';

function getBackground() {
  let width = window.innerWidth;
  let height = window.innerHeight + 100;
  let url = `https://source.unsplash.com/featured/${width}x${height}/?nature`;
  let content = document.getElementById('content-wrapper');
  document.body.style.backgroundImage = `url(${url})`;
}
 
const dailyGoalInput = document.getElementById('dailyGoal');
dailyGoalInput.addEventListener('change', () => { 
  saveGoal('daily' , {status: "active", date: Date.now(), value: dailyGoalInput.value});
  dailyGoalInput.value = '';
});

const weeklyGoalInput = document.getElementById('weeklyGoal');
weeklyGoalInput.addEventListener('change', () => { 
  saveGoal('weekly' , {status: "active", date: Date.now(), value: weeklyGoalInput.value}); 
  weeklyGoalInput.value = '';
});

const yearlyGoalInput = document.getElementById('yearlyGoal');
yearlyGoalInput.addEventListener('change', () => { 
  saveGoal('yearly' , {status: "active", date: Date.now(), value: yearlyGoalInput.value}); 
  yearlyGoalInput.value = '';
});

const helpBtn = document.getElementsByClassName('help');
for (let i = 0; i < helpBtn.length; i++) {
  helpBtn[i].addEventListener('click', () => {
    const helpBox = document.getElementById('getHelp');
    if (helpBox.getAttribute('class') === "get-help hidden") {
      helpBox.classList.remove('hidden');
    } else {
      helpBox.classList.add('hidden');
    }
  });
}

document.getElementsByClassName('tool')[0].addEventListener('click', () => {
  if (document.getElementsByClassName('tool')[0].getAttribute('class') === 'tool active') {
    document.getElementsByClassName('tool')[0].classList.remove('active');
    let gs = document.getElementsByClassName('goal-section');
    for(let i =0; i < gs.length; i++) {
      gs[i].classList.add('hidden');
    }
  } else {
    document.getElementsByClassName('tool')[0].classList.add('active');
    let gs = document.getElementsByClassName('goal-section');
    for(let i =0; i < gs.length; i++) {
      gs[i].classList.remove('hidden');
    }
  }
});

const linksPopover = document.getElementById('links-popover');

document.getElementById('links-trigger').addEventListener('click', (e) => {
  linksPopover.getAttribute('class') === 'hidden' ? linksPopover.classList.remove('hidden') : linksPopover.classList.add('hidden');
  // linksPopover.focus();
});

linksPopover.addEventListener('blur', (e) => {
  // linksPopover.classList.add('hidden');
});

const addBtn = document.getElementById('add-link');
addBtn.addEventListener('click', (e) => {
  let linkInput = document.createElement('input');
  linkInput.classList.add('add-link-input');
  linkInput.value = "http://"
  addBtn.append(linkInput);
  linkInput.focus();
  linkInput.addEventListener('keypress', (e) => {
    if(e.key === "Enter") {
      console.log(e.target.value);
      addLink(linkInput.value);
      linkInput.blur();
    }
  });

  linkInput.addEventListener('blur', (e) => {
    addBtn.removeChild(document.getElementsByClassName('add-link-input')[0]);
  });
});

const goalSelectionDivs = document.querySelectorAll('.goal-selection');
goalSelectionDivs.forEach(div => {
  div.addEventListener('click', (e) => {
    if(!e.target.classList.contains('selected-goal')) {
      if(e.target.innerHTML === 'active') {
        e.target.nextElementSibling.classList.remove('selected-goal');
        e.target.classList.add('selected-goal');
        let period = e.target.parentNode.getAttribute('data-period')
        getGoals(period).then(goals => {
          setGoals(period, goals, 'active');
        });
      } else {
        e.target.previousElementSibling.classList.remove('selected-goal');
        e.target.classList.add('selected-goal');
        let period = e.target.parentNode.getAttribute('data-period');
        getGoals(period).then(goals => {
          setGoals(period, goals, 'completed');
        });
      }
    } 
  });
});

document.addEventListener('DOMContentLoaded', () => {
  getBackground();
  initGoals();
  initLinks();
  initQuote();
  startTime();
  makeLinksClickable();
  getLocation();
});
