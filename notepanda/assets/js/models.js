var Note = Backbone.Model.extend({
  initialize: function() {
    var id = this.get('id');
    if(!id) {
      var uid, unique = false;
      while(!unique) {
        uid = UID();
        if(panda.notes.get(uid) === undefined) { unique = true; }
      }
      this.set({"id": uid});
    }
  }
});

var Notes = Backbone.Collection.extend({
  model: Note,

  sync_notes: function(callback) {
    panda.client.writeFile("notes.json", JSON.stringify(this.toJSON()), function(error, stat) {
      if(callback) {
        callback.call(this, error, stat);
      }
    });
  },

  get_parents: function(parent_id) {
    var parents = [];
    while(parent_id !== undefined){
      parent = this.get(parent_id);
      if(parent_id === "root"){
        parents.unshift({
          name: 'Home',
          url: '#!/'
        });
      }
      if(parent) {
        parent_id = parent.get('parent_id');
        parents.unshift({
          name: parent.get('name'),
          url: '#!/notes/' + parent.get('id')
        });
      } else {
        parent_id = parent;
      }
    }
    return parents;
  },

  with_parent: function(parent) {
    return this.filter(function(note) {
      return note.get('parent_id') === parent;
    });
  }
});
