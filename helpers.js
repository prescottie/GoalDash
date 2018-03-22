export function toggleClass(elm, classRemove, classAdd) {
  elm.classList.remove(classRemove);
  elm.classList.add(classAdd);
}

export function timeSince(date) {
  let d = new Date (date);
  let seconds = Math.floor((Date.now() - d) / 1000);
  if(seconds < 86400) {
    if(seconds < 5) {
      return "Just now";
    }
    if(seconds > 5 && seconds < 60) {
      return seconds + " seconds ago";
    }
    if(seconds > 60 && seconds < 3600) {
      return Math.floor(seconds/60) + " minutes ago";
    }
    if(seconds > 3600) {
      return Math.floor(seconds/3600) + " hours ago";
    }
  } else if(seconds > 86400 && seconds < 	604800) {
    switch(d.getDay()){
      case 0:
        return "Sun";
        break;
      case 1:
        return "Mon";
        break;
      case 2:
        return "Tues";
        break;
      case 3:
        return "Wed";
        break;
      case 4:
        return "Thurs";
        break;
      case 5:
        return "Fri";
        break;
      case 6:
        return "Sat";
        break;
      default:
        console.log('could not get day');
    }
  } else if (seconds > 604800 && seconds < 31536000 ) {
    switch(d.getMonth()){
      case 0:
        return "Jan " + d.getDay();
        break;
      case 1:
        return "Feb " + d.getDay();
        break;
      case 2:
        return "Mar " + d.getDay();
        break;
      case 3:
        return "Apr " + d.getDay();
        break;
      case 4:
        return "May " + d.getDay();
        break;
      case 5:
        return "Jun " + d.getDay();
        break;
      case 6:
        return "Jul " + d.getDay();
        break;
      case 7:
        return "Aug " + d.getDay();
        break;
      case 8:
        return "Sept " + d.getDay();
        break;
      case 9:
        return "Oct " + d.getDay();
        break;
      case 10:
        return "Nov " + d.getDay();
        break;
      case 11:
        return "Dec " + d.getDay();
        break;
      default:
        console.log('could not find date');
    }
  } else if(seconds > 31536000 ) {
    return d.toLocaleDateString();
  }
}

export function startTime() {
  let today = new Date();
  let h = today.getHours();
  let m = today.getMinutes();
  m = checkTime(m);
  document.getElementById('timestamp').innerHTML =
  h + ":" + m;
  let t = setTimeout(startTime, 500);
}
export function checkTime(i) {
  if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
  return i;
}

export function updateTabUrl(u) {
  chrome.tabs.update({ url: u });
}
