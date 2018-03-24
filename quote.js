export function fetchQuote() {
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

export function setQuote(quote) {
  const quotebox = document.getElementById('quotebox');
  const quoteContent = document.createElement('h3');
  const quoteAuthor = document.createElement('h4');
  quotebox.append(quoteContent);
  quotebox.append(quoteAuthor);
  quoteContent.innerHTML = `\"${quote.quote}\"`;
  quoteContent.style.fontStyle = 'italic';
  quoteAuthor.innerHTML = `--${quote.author}`;
}

export function initQuote() {
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