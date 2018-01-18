Papa.parse('data/file.csv', {
  download: true,
  header: true,
  complete: function(results) {
    console.log(results);
    var documents = results.data;
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
  }
});
