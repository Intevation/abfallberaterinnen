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

var test;

Papa.parse('data/zuordnung_plz_ort_landkreis.csv', {
  download: true,
  header: true,
  complete: function(results) {
    test = results.data;
  }});

req.onload = function(e) {
  /* parse the data when it is received */
  var wb = XLSX.read(req.response, { type: 'array' });

  var documents = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { range: 3 });

  mySpinner.style.display = 'none';

  function uniq(a) {
    return Array.from(new Set(a));
  }

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
        // var query = this.query.toLowerCase();
        var query = this.query;
        if (query.match(/[0-9]{2,}/)) {
          console.log(query);
          var patternPlz = new RegExp('^' + query + '.*$');
          test.forEach(function(item) {
            // Suchabfrage
            if (item.hasOwnProperty('plz') && item.plz.match(patternPlz)) {
              results.push(documents.find(function(obj) {
                return obj.Verwaltungeinheit === item.landkreis
              }));
            }
          });
          if (results.length > 0) {
            this.count = uniq(results).length;
            this.results = uniq(results);
            console.log(uniq(results));
          } else {
            this.count = '';
            this.results = [];
          }
        } else if (query.match(/[a-zA-Z]{3,}/)) {
          console.log(query);
          var patternOrt = new RegExp('^' + query + '.*$');
          test.forEach(function(item) {
            // Suchabfrage
            if (item.hasOwnProperty('ort') && item.ort.match(patternOrt)) {
              results.push(documents.find(function(obj) {
                return obj.Verwaltungeinheit === item.landkreis
              }));
            }
          });
          if (results.length > 0) {
            this.count = uniq(results).length;
            this.results = uniq(results);
            console.log(uniq(results));
          } else {
            this.count = '';
            this.results = [];
          }
        } else {
          this.count = '';
          this.results = [];
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
