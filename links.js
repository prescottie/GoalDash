import {updateTabUrl} from './helpers.js';

export function makeLinksClickable() {
  let clickableLinks = document.getElementsByClassName('link');
  for(let i = 0; i < clickableLinks.length; i++ ) {
    clickableLinks[i].addEventListener('click', (e) => {
      let url = clickableLinks[i].getAttribute('data-url');
      updateTabUrl(url);
    });
  }
}

export function addLink(url) {
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

export function getLinks() {
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

export async function removeLink(url) {
  let links = await getLinks();
  let index = links.findIndex(link => link.url === url);
  if(index > -1) {
    links.splice(index, 1);
  }
  chrome.storage.sync.set({"links":links}, () => {
    console.log('link removed');
  });
  setLinks(links);
}

export async function initLinks() {
  let links = await getLinks();
  setLinks(links);
} 