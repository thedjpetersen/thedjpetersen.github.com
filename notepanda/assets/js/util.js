$.fn.hasAttr = function(name){
  var checkAttr = function(attr) {
    return (typeof attr !== 'undefined' && attr !== false);
  };
  return $(_.filter(this, function(el) { return checkAttr($(el).attr(name)); }, this));
};

function UID() {
  var S4 = function() {
    return Math.floor(Math.random()*0x10000).toString(16);
  };
  return S4()+S4()+S4()+S4();
}

var fetch_templates = function(path, callback) {
  $.get(path, function(data) {
   $(data).hasAttr('id').each(function(index, element) {
     $el = $(element);
     panda.templates[$el.attr('id')] = Handlebars.compile($el.html());
   });
   if(callback) { callback.call(this); }
  });
};

var setup_notes = function(callback) {
  panda.client.readdir("/", function(error, entries) {
    if(entries.indexOf("notes.json") === -1){
      panda.client.writeFile("notes.json", "[]", function(error, stat) {
        panda.notes = new Notes([]);
        callback.call(this);
      });
    } else {
      panda.client.readFile("notes.json", function(error, data) {
        panda.notes = new Notes(JSON.parse(data));
        callback.call(this);
      });
    }
  });
};
