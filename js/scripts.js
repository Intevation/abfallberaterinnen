var mySpinner = document.getElementById('mySpinner');
mySpinner.style.display = 'block';

/* set up an async GET request */
var req = new XMLHttpRequest();
// https://www.dropbox.com/s/o6mz0i0984v0joi/Abfallberatungen_Dropbox.xlsx?dl=0
// www.dropbox.com doesn't support cors use dl.dropboxusercontent.com instead.
// https://dl.dropboxusercontent.com/s/o6mz0i0984v0joi/Abfallberatungen_Dropbox.xlsx?raw=1&dl=1
req.open('GET', 'data/Abfallberatungen_Dropbox.xlsx', true);
// req.open('GET', 'https://dl.dropboxusercontent.com/s/o6mz0i0984v0joi/Abfallberatungen_Dropbox.xlsx?raw=1&dl=1', true);
// req.open(
//  'GET',
//  'https://owncloud.nabu.de/owncloud/index.php/s/sn3rUqxW98Gjd3F/download',
//  true
// );
req.responseType = 'arraybuffer';

var zuordnung;
var filterZuordnungen;

Papa.parse('data/zuordnung_plz_ort_landkreis.csv', {
  download: true,
  header: true,
  complete: function(results) {
    zuordnung = results.data;
  }
});

req.onload = function(e) {
  /* parse the data when it is received */
  var wb = XLSX.read(req.response, { type: 'array' });

  var abfallberater = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {
    range: 3
  });

  var filterPLZ = abfallberater.filter(function(item) {
    return item.hasOwnProperty('PLZ');
  });

  var filterEntsorgungsgebiet = abfallberater.filter(function(item) {
    return item.hasOwnProperty('Entsorgungsgebiet');
  });

  // Entferne alle Orte aus zuordnung_plz_ort_landkreis.csv welche bereits in  Abfallberatungen_Dropbox.xlsx sind.
  filterZuordnungen = zuordnung.filter(function(z) {
    return !filterEntsorgungsgebiet.some(function(e) {
      return z.ort === e.Entsorgungsgebiet;
    });
  });

  mySpinner.style.display = 'none';

  new Vue({
    el: '#app',
    data: {
      query: '',
      results: []
    },
    methods: {
      search: function() {
        var results = new Set();
        // var query = this.query.toLowerCase();
        var query = this.query;
        // Suche nach Postleitzahlen
        if (query.match(/[0-9]{2,}/)) {
          // var patternPlz = new RegExp('^' + query + '.*$');
          var patternPlz = new RegExp(
            '(^' + query + '|\\s' + query + '|,+' + query + ')'
          );
          filterZuordnungen.forEach(function(item) {
            if (item.hasOwnProperty('plz') && item.plz.match(patternPlz)) {
              var found = abfallberater.find(function(obj) {
                if (
                  obj.hasOwnProperty('Verwaltungeinheit') &&
                  obj.Verwaltungeinheit === item.kreis
                ) {
                  return obj.Verwaltungeinheit === item.kreis;
                }
              });
              if (found !== undefined) {
                results.add(found);
              }
            }
          });
          filterPLZ.filter(function(item) {
            if (item.PLZ.match(patternPlz)) {
              results.add(item);
            }
          });
          if (results.size > 0) {
            this.results = Array.from(results);
          } else {
            this.results = [];
          }
          // Suche nach Orten
        } else if (query.match(/[a-zA-Z]{2,}/)) {
          var patternOrt = new RegExp('^' + query.trim() + '.*$', 'gim');
          filterZuordnungen.forEach(function(item) {
            // Suchabfrage
            if (item.hasOwnProperty('ort') && item.ort.match(patternOrt)) {
              var found = abfallberater.find(function(obj) {
                return obj.Verwaltungeinheit === item.kreis;
              });
              if (found !== undefined) {
                results.add(found);
              }
            }
          });
          filterEntsorgungsgebiet.forEach(function(item) {
            // Suchabfrage
            if (
              item.hasOwnProperty('Entsorgungsgebiet') &&
              item.Entsorgungsgebiet.match(patternOrt)
            ) {
              results.add(item);
            }
          });
          if (results.size > 0) {
            this.results = Array.from(results);
          } else {
            this.results = [];
          }
        } else {
          this.results = [];
        }
      }
    }
  });
};
req.send();

/// / This is the service worker with the Cache-first network
//
/// / Add this below content to your HTML page, or add the js file to your page at the very top to register sercie worker
// if (navigator.serviceWorker.controller) {
//  console.log('[PWA Builder] active service worker found, no need to register')
// } else {
/// / Register the ServiceWorker
//  navigator.serviceWorker.register('service-worker.js', {
//    scope: './'
//  }).then(function(reg) {
//    console.log('Service worker has been registered for scope:' + reg.scope);
//  });
// }
