var noteView = Backbone.View.extend({
  initialize: function() {
    this.parents = panda.notes.get_parents(this.options.model.get('parent_id'));
    this.children = panda.notes.with_parent(this.options.model.get('id'));

  },

  events: {
    'click .new_note': 'new_note',
    'click .category, .note': 'view_note',
    'click .delete': 'delete_note',
    'click a i': 'clean_tooltips'
  },

  attributes: {
    "class": "row"
  },

  render: function() {
    var type = this.options.model.get('type');
    this.$el.html(panda.templates[type].call(this, {
      model: this.options.model.attributes,
      children: this.children,
      parents: this.parents
    }));
    return this;
  },

  attachToolTip: function() {
    this.$el.find('i').tooltip();
  },

  new_note: function() {
    var id = this.options.model.get('id');
    panda.router.navigate('#!/new_note/' + id, {trigger: true});
  },

  view_note: function(event) {
    var target_href = $(event.target).attr('data-href');
    if(target_href) {
      panda.router.navigate(target_href, {trigger: true});
    }
  },

  delete_note: function(event) {
    event.preventDefault();
    var should_delete = confirm("Are you sure you want to delete this note/category? " +
                                "All children of this item will be inherited by this item's" +
                                " parent.");
    if(should_delete) {
      _.each(this.children, function(child) {
        child.set({'parent_id': this.options.model.get('parent_id')});
      }, this);
      panda.notes.remove(this.options.model);
      panda.notes.sync_notes();
      panda.router.navigate("/#!/", {trigger: true});
    }
  },

  clean_tooltips: function() {
    $('.tooltip').remove();
  }
});

var editNoteView = Backbone.View.extend({
  events: {
    'click .save': 'save'
  },

  render: function() {
    if(this.options.model) {
      this.$el.html(panda.templates.edit_note({
        name: this.options.model.get('name'),
        content: this.options.model.get('content')
      }));
    } else {
      this.$el.html(panda.templates.edit_note({
        name: '',
        content: ''
      }));
    }
    this.$el.find('textarea').wysihtml5({
      'html': true,
      'color': true
    });
    return this;
  },

  save: function(event) {
    event.preventDefault();
    var name = this.$el.find('input').val();
    var content = this.$el.find('textarea').val();
    var id = '';

    if(name.length === 0) {
      return;
    }

    if(this.options.model) {
      this.options.model.set({
        name: name,
        content: content,
        type: content ? 'note' : 'category'
      });
      id = this.options.model.get('id');
    } else {
      panda.notes.add({
        name: name,
        content: content,
        type: content ? 'note' : 'category',
        parent_id: this.options.pid
      });
      var model = _.last(panda.notes.models);
      id = model.get('id');
    }
    panda.notes.sync_notes();
    panda.router.navigate('#!/notes/' + id, {trigger: true});
  }
});
