function getBackground() {
  let width = window.innerWidth;
  let height = window.innerHeight;
  let url = `https://source.unsplash.com/featured/${width}x${height}/?nature`;
  let content = document.getElementById('content-wrapper');
  document.body.style.backgroundImage = `url(${url})`;
}

function setGoals(period, goals) { 
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
      const xButton = document.createElement('button');
      const checkbox = document.createElement('span');
      checkbox.addEventListener('click', () => {
        getGoals(period).then(goals => goals);
        goals[period][i].isDone ? goals[period][i].isDone = false : goals[period][i].isDone = true;
        chrome.storage.sync.set(goals, () => {
          console.log('goal updated');
        });
        goals[period][i].isDone ? toggleClass(checkbox, 'unchecked', 'checked') : toggleClass(checkbox, 'checked', 'unchecked');
      });

      goal.isDone ? toggleClass(checkbox, 'unchecked', 'checked') : toggleClass(checkbox, 'checked', 'unchecked');
      span.innerHTML = goal.value;
      xButton.setAttribute('data-period', period);
      xButton.setAttribute('data-goal', goal.value);
      span.classList.add('goal-span');
      li.classList.add('goal-item');
      div.classList.add('goal-div');
      checkbox.classList.add('checkbox');
      xButton.classList.add('x-btn');
      xButton.innerHTML = '&#10005';
      li.append(div);
      div.append(span);
      div.prepend(checkbox);
      div.append(xButton);
      ol.prepend(li);
      span.addEventListener('dblclick', (eDbl) => {
        console.log(eDbl.target);
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

          console.log(eBlur.target.innerHTML);
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

function toggleClass(elm, classRemove, classAdd){
  elm.classList.remove(classRemove);
  elm.classList.add(classAdd);
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

async function editGoals(period, prevValue, nextValue) {
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
  console.log('set goal', goals);
  
  setGoals(period, goals);
}

async function removeGoal(period, value) {
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

function getStarted() {
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
      saveGoal('yearly' , {isDone: false, date: Date.now(), value: yearStartInput.value}); 
      yearStart.classList.add('hidden');
      weekStart.classList.remove('hidden');
    });
    weekStartInput.addEventListener('change', () => {
      saveGoal('weekly' , {isDone: false, date: Date.now(), value: weekStartInput.value});
      weekStart.classList.add('hidden');
      dayStart.classList.remove('hidden');
    });
    dayStartInput.addEventListener('change', () => {
      saveGoal('daily' , {isDone: false, date: Date.now(), value: dayStartInput.value});
      dayStart.classList.add('hidden');
      for(let i = 0; i < gSection.length; i++) {
        gSection[i].classList.remove('hidden');
      }
      document.getElementById('getHelp').classList.add('hidden');
    }); 
}

async function initGoals() {
  let daily = await getGoals('daily');
  let weekly = await getGoals('weekly');
  let yearly = await getGoals('yearly');
  if( !daily.daily && !weekly.weekly && !yearly.yearly) {
    getStarted();  
  } else {
    let date = new Date();
    let d = new Date(daily.daily[0] ? daily.daily[0].date: Date.now());
    if(date.toDateString === d.toDateString) {
      setGoals('daily', daily);
      console.log("same day");
    } else {
      chrome.storage.sync.set({'daily': []}, () => {
        console.log('new day, goals reset');
      });
      setGoals('daily', daily);
    }
    setGoals('weekly', weekly);
    setGoals('yearly', yearly);
  }
}

function fetchQuote() {
  fetch('https://quotes.rest/qod?category=inspire', {
    headers: {
      "Accept": "application/json"
    },
    method: 'GET'
  }).then(response => response.json())
  .then(quote => {
    let q = quote.contents.quotes[0];
    chrome.storage.sync.set({"quote": q}, () => {
      console.log('quote set');
      setQuote(q);
    });
  });
}

function setQuote(quote) {
  const quotebox = document.getElementById('quotebox');
  const quoteContent = document.createElement('h3');
  const quoteAuthor = document.createElement('h4');
  quotebox.append(quoteContent);
  quotebox.append(quoteAuthor);
  quoteContent.innerHTML = `\"${quote.quote}\"`;
  quoteContent.style.fontStyle = 'italic';
  quoteAuthor.innerHTML = `--${quote.author}`;
}

function initQuote() {
  chrome.storage.sync.get('quote', (quoteObj) => {
    if (quoteObj.quote) {
      let quoteDate = new Date(quoteObj.quote.date);
      console.log(quoteDate);
      let timeSinceQuote = Date.now() - quoteDate;
      console.log(timeSinceQuote);
 
      if(timeSinceQuote > 86400000) {
        fetchQuote();
      } else {
        setQuote(quoteObj.quote);
      }
    } else {
      fetchQuote();
    }
  });
}

function getLocation() {
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(getWeather);
  } else {
    console.log('Location unavailable');
  }
}

function getWeather(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&APPID=5532a9cf8f9fc2b07e8d2b32baf440e4`, {
    method: 'GET'
  }).then(res => res.json())
  .then(weather => {
    const icon = getWeatherIcon(weather.weather[0].icon);
    const temp = Math.round(weather.main.temp);
    document.getElementById('weatherCity').innerHTML = weather.name;
    document.getElementById('weatherTemp').innerHTML = temp + "°";
    document.getElementById('weatherDescript').innerHTML = weather.weather[0].description;
    document.getElementById('weatherIcon').innerHTML = icon;
  })
}

function getWeatherIcon(iconID) {
  if(iconID === '01d') {
    return "☀️";
  } else if (iconID === '01n') {
    return "🌙" ;
  } else if (iconID === '02d') {
    return "⛅";
  } else if (iconID === '02n') {
    return "☁️";
  } else if (iconID === '03d' || iconID === '03n' || iconID === '04d' || iconID === '04n') {
    return "☁️";
  } else if (iconID === '09d' || iconID === '09n' || iconID === '10d' || iconID === '10d') {
    return "🌧";
  } else if (iconID === '11d' || iconID === '11n') {
    return "🌩";
  } else if (iconID === '13d' || iconID === '13n') {
    return "❄️";
  } else {
    return false;
  }
}
 
const dailyGoalInput = document.getElementById('dailyGoal');
dailyGoalInput.addEventListener('change', () => { 
  saveGoal('daily' , {isDone: false, date: Date.now(), value: dailyGoalInput.value});
  dailyGoalInput.value = '';
});

const weeklyGoalInput = document.getElementById('weeklyGoal');
weeklyGoalInput.addEventListener('change', () => { 
  saveGoal('weekly' , {isDone: false, date: Date.now(), value: weeklyGoalInput.value}); 
  weeklyGoalInput.value = '';
});

const yearlyGoalInput = document.getElementById('yearlyGoal');
yearlyGoalInput.addEventListener('change', () => { 
  saveGoal('yearly' , {isDone: false, date: Date.now(), value: yearlyGoalInput.value}); 
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

function startTime() {
  let today = new Date();
  let h = today.getHours();
  let m = today.getMinutes();
  m = checkTime(m);
  document.getElementById('timestamp').innerHTML =
  h + ":" + m;
  let t = setTimeout(startTime, 500);
}
function checkTime(i) {
  if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
  return i;
}

document.getElementsByClassName('G')[0].addEventListener('click', () => {
  if (document.getElementsByClassName('G')[0].getAttribute('class') === 'G active') {
    document.getElementsByClassName('G')[0].classList.remove('active');
    let gs = document.getElementsByClassName('goal-section');
    for(let i =0; i < gs.length; i++) {
      gs[i].classList.add('hidden');
    }
  } else {
    document.getElementsByClassName('G')[0].classList.add('active');
    let gs = document.getElementsByClassName('goal-section');
    for(let i =0; i < gs.length; i++) {
      gs[i].classList.remove('hidden');
    }
  }
});

const links = document.getElementById('links-popover');

document.getElementById('links-trigger').addEventListener('click', (e) => {
  links.getAttribute('class') === 'hidden' ? links.classList.remove('hidden') : links.classList.add('hidden');
  links.focus();
});

links.addEventListener('blur', (e) => {
  links.classList.add('hidden');
});

function updateTabUrl(u) {
  chrome.tabs.update({ url: u });
}

let clickableLinks = document.getElementsByClassName('link');
for(let i = 0; i < clickableLinks.length; i++ ) {
  clickableLinks[i].addEventListener('click', (e) => {
    let url = clickableLinks[i].getAttribute('data-url');
    updateTabUrl(url);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  getBackground();
  initGoals();
  initQuote();
  startTime();
  getLocation();
});
