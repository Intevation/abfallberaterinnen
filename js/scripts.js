/* set up an async GET request */
var req = new XMLHttpRequest();
req.open('GET', 'data/Abfallberatungen_Dropbox.xlsx', true);
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
