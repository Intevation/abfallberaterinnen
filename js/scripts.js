var mySpinner = document.getElementById('mySpinner');
mySpinner.style.display = 'block';

/* set up an async GET request */
var req = new XMLHttpRequest();
// https://www.dropbox.com/s/o6mz0i0984v0joi/Abfallberatungen_Dropbox.xlsx?dl=0
// www.dropbox.com doesn't support cors use dl.dropboxusercontent.com instead.
// https://dl.dropboxusercontent.com/s/o6mz0i0984v0joi/Abfallberatungen_Dropbox.xlsx?raw=1&dl=1
// req.open('GET', 'data/Abfallberatungen_Dropbox.xlsx', true);
req.open('GET', 'https://dl.dropboxusercontent.com/s/o6mz0i0984v0joi/Abfallberatungen_Dropbox.xlsx?raw=1&dl=1', true);
req.responseType = 'arraybuffer';

req.onload = function(e) {
  /* parse the data when it is received */
  var wb = XLSX.read(req.response, { type: 'array' });

  var documents = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { range: 3 });

  lunr.tokenizer.separator = /[\s\-\,]+/

  var idx = lunr(function() {
    this.ref('id')
    this.field('PLZ')

    documents.forEach(function(doc) {
      this.add(doc)
    }, this)
  });

  mySpinner.style.display = 'none';

  new Vue({
    el: '#app',
    data: {
      query: '',
      results: [],
      count: ''

    },
    methods: {
      search: function() {
        var results = [];
        var query = this.query.toLowerCase();
        var searchResults = [];
        if (query) {
          searchResults = idx.query(function(q) {
            q.term(query, {
              wildcard: lunr.Query.wildcard.TRAILING
            })
          });
          if (searchResults.length > 0) {
            this.count = searchResults.length;
            for (var item in searchResults) {
              results.push(documents.find(function(obj) { return obj.id === searchResults[item].ref }));
            }
            this.results = results;
          } else {
            this.results = [];
            this.count = '';
          }
        } else {
          this.results = [];
          this.count = '';
        }
      }
    }
  });
};
req.send();

// This is the service worker with the Cache-first network

// Add this below content to your HTML page, or add the js file to your page at the very top to register sercie worker
if (navigator.serviceWorker.controller) {
  console.log('[PWA Builder] active service worker found, no need to register')
} else {
// Register the ServiceWorker
  navigator.serviceWorker.register('service-worker.js', {
    scope: './'
  }).then(function(reg) {
    console.log('Service worker has been registered for scope:' + reg.scope);
  });
}
