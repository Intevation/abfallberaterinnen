var mySpinner = document.getElementById('mySpinner');
mySpinner.style.display = 'block';

var xlsxSource = 'data/Kandidaten_gefiltert_20210602.xlsx';
var plzsource = 'data/PLZ_WK.csv';

/* set up an async GET request */
var req = new XMLHttpRequest();
req.responseType = "arraybuffer";
req.open('GET', xlsxSource, true);

var allPlz;
var allCandidates;

Papa.parse(plzsource, {
  download: true,
  header: true,
  complete: function(results) {
    allPlz = results.data;
  }
});

req.onload = function(e) {
  var wb = XLSX.read(req.response, {type: "buffer",raw: true});

  var ws = wb.Sheets[wb.SheetNames[0]];
  allCandidates = XLSX.utils.sheet_to_json(ws, {range: 2});

  mySpinner.style.display = 'none';

  new Vue({
    el: '#app',
    data: {
      query: '',
      results: []
    },
    methods: {
      search: function() {
      // searches after three input numbers
      // results contains an array of arrays of candidates with properties:
      // PRAEFIX VORNAME NACHNAME PARTEI STRASSEPOSTFACHWK PLZWK ORTWK
      // TELEFONVORWAHLWK TELEFONNUMMERWK EMAIL1 INTERNET TWITTER FACEBOOK
      // INSTAGRAM WKNR WKNAME
        var results = new Set();
        var query = this.query;
        // Suche nach Postleitzahlen
        var wkPLZ;
        var wk = []; // all matching Wahlkreisnummer
        if (query.match(/[0-9]{3,}/)) {
          var patternPlz = new RegExp(
            '(^' + query + '|\\s' + query + '|,+' + query + ')'
          );
          wkPLZ = allPlz.filter(function(i){ // alle passenden Wahlkreise
            return i.PLZ && i.PLZ.match(patternPlz);
          });
        // // Suche nach WK-Bezeichnung
        } else if (query.match(/[a-zA-Z]{4,}/)) {
          var patternOrt = new RegExp(query.trim() + '.*$', 'gim');
          wkPLZ = allPlz.filter(function(i){
            return i.Bezeichnung && i.Bezeichnung.match(patternOrt);
          });
        } else {
          return results;
        }
        for (var i=0; i < wkPLZ.length; i++) {
          if (!wk.find(function(w){
            return w.Wahlkreisnummer === wkPLZ[i].Wahlkreisnummer
            })
          )
          {
            wk.push(wkPLZ[i]);
          }
        }
        wk.forEach(function(item) {
          var cands = allCandidates.filter(function(obj) {
            return obj.WKNR === item.Wahlkreisnummer;
          })
          if (cands.length) {
            for (var j = 0; j < cands.length; j ++) {
              cands[j].WKNAME = item.Bezeichnung;
            }
            results.add(cands);
          }
        });
        this.results = Array.from(results);
      }
    }
  });
};
req.send();

