import {timeSince, toggleClass, startTime, checkTime, updateTabUrl} from './helpers.js';

function getBackground() {
  let width = window.innerWidth;
  let height = window.innerHeight + 100;
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
      const goalTime = document.createElement('time');
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
  
  setGoals('daily', daily);
  setGoals('weekly', weekly);
  setGoals('yearly', yearly);

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
      let timeSinceQuote = Date.now() - quoteDate;
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

const locationOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 3600000
};

function getLocation() {
  chrome.storage.sync.get("weather", (w) => {
    if (w.weather) {
      let weatherTime = new Date(w.weather.time);
      let timeSinceWeather = Date.now() - weatherTime;
      if(timeSinceWeather > 600000) {
        console.log("weather needs updating");
        
        navigator.geolocation.getCurrentPosition(fetchWeather, geoError, locationOptions);
      } else if (timeSinceWeather < 600000) {
        console.log("weather is okay for now I think");
        setWeather(w.weather)
      }
    } else {
      navigator.geolocation.getCurrentPosition(fetchWeather, geoError, locationOptions);
    } 
  });
}

function geoError(error) {
  console.error(error)
}

function fetchWeather(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&APPID=5532a9cf8f9fc2b07e8d2b32baf440e4`, {
    method: 'GET'
  }).then(res => res.json())
  .then(w => {
    const weather = {};
    weather.iconId = w.weather[0].icon;
    weather.temp = Math.round(w.main.temp);
    weather.city = w.name;
    weather.description = w.weather[0].description;
    weather.time = Date.now();
    chrome.storage.sync.set({"weather":weather}, () => {
      console.log("weather updated");
    });
    setWeather(weather);
  });
}

function getWeather(position) {
  chrome.storage.sync.get("weather", (w) => {
    if (w.weather) {
      let weatherTime = new Date(w.weather.time);
      let timeSinceWeather = Date.now() - weatherTime;
      if(timeSinceWeather > 600000) {
        fetchWeather(position);
      } else {
        setWeather(w.weather);
      }
    } else {
      fetchWeather(position);
    }
  });
}

async function setWeather(weather) {
  const icon = getWeatherIcon(weather.iconId);
  document.getElementById('weatherCity').innerHTML = weather.city;
  document.getElementById('weatherTemp').innerHTML = weather.temp + "°";
  document.getElementById('weatherDescript').innerHTML = weather.description;
  document.getElementById('weatherIcon').innerHTML = icon;
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
  } else if (iconID === '09d' || iconID === '09n' || iconID === '10d' || iconID === '10n') {
    return "🌧";
  } else if (iconID === '11d' || iconID === '11n') {
    return "🌩";
  } else if (iconID === '13d' || iconID === '13n') {
    return "❄️";
  } else {
    return "";
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

function makeLinksClickable() {
  let clickableLinks = document.getElementsByClassName('link');
  for(let i = 0; i < clickableLinks.length; i++ ) {
    clickableLinks[i].addEventListener('click', (e) => {
      let url = clickableLinks[i].getAttribute('data-url');
      updateTabUrl(url);
    });
  }
}

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
    addBtn.removeChild(document.querySelector('.add-link-input'));
  });
});

function addLink(url) {
  fetch(`https://opengraph.io/api/1.1/site/${url}?app_id=5ab40045c8869a6a06cf1e58`, {
    headers: {
      "Accept": "application/json"
    },
    method: 'GET'
  }).then(response => response.json())
  .then(siteInfo => {
    saveLink({image: siteInfo.hybridGraph.image, siteName: siteInfo.hybridGraph.site_name, url: url});
  });
}

function getLinks() {
  return new Promise(resolve => {
    chrome.storage.sync.get('links', (links) => {
      if(!links.links) {
        resolve(links = []);
      } else {
        resolve(links.links);
      }
      
    });
  });
}

async function saveLink(value) {
  let links = await getLinks();
  links.push(value)
  chrome.storage.sync.set({"links":links}, () => {
    console.log('link saved');
  });
  console.log('saved link', links);  
  setLinks(links);
}

function setLinks(linkArr) {
  const customLinks = document.getElementById('custom-links');
  while(customLinks.firstChild) {
    customLinks.removeChild(customLinks.firstChild);
  }
  linkArr.forEach((link, i) => {
    console.log('setting link');
    
    let linkDiv = document.createElement('div');
    linkDiv.classList.add('link');
    linkDiv.setAttribute('data-url', link.url);
    let linkIcon = document.createElement('img');
    linkIcon.classList.add('link-icon');
    linkIcon.setAttribute('src', link.image);
    let linkSpan = document.createElement('span');
    linkSpan.classList.add('link-title');
    linkSpan.innerHTML = link.siteName;
    let linkX = document.createElement('span');
    linkX.classList.add('link-x');
    
    linkX.innerHTML = '&#10005';
    linkX.addEventListener('click', (e) => {
      e.stopPropagation();
      let url = e.target.parentNode.getAttribute('data-url');
      removeLink(url);
    });

    linkDiv.append(linkIcon)
    linkDiv.append(linkSpan);
    linkDiv.append(linkX);

    customLinks.append(linkDiv);
  });
  makeLinksClickable();
}

async function removeLink(url) {
  let links = await getLinks();
  let index = links.findIndex(link => link.url === url);
  if(index > -1) {
    links.splice(index, 1);
  }
  chrome.storage.sync.set({"links":links}, () => {
    console.log('goal removed');
  });
  setLinks(links);
}

async function initLinks() {
  let links = await getLinks();
  setLinks(links);
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

document.addEventListener('DOMContentLoaded', () => {
  getBackground();
  initGoals();
  initLinks();
  initQuote();
  startTime();
  makeLinksClickable();
  getLocation();
});
