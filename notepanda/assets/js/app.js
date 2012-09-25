$(document).ready(function(){
  panda = {
    templates: {},

    client: new Dropbox.Client({
      key: "Qit/i9Q0iVA=|df11lX0SAerN77//mK+Vfz2AnrTiED1NApQWKsgAaw==", sandbox: true
    }),
    
    login: function(callback){
      this.client.authenticate(function(error, client) {
        if (error) {return showError(error);}
        setup_notes(function(){
          panda.router.navigate('#!/', {trigger: true});
        });
      });
    }
  };

  var appRouter = Backbone.Router.extend({
    routes: {
      '!/': 'main',
      '!/login/': 'login',
      '!/logout/': 'logout',
      '!/notes/:nid': 'view_note',
      '!/notes/:nid/edit': 'edit_note',
      '!/new_note/:pid': 'new_note',
      '?_dropboxjs_scope*path': 'callback',
      '*path': 'catchall'
    },

    main: function() {
      if(panda.client.authState === 1) {
        $('.content').html(panda.templates.loggedout_splash());
      } else {
        panda.client.getUserInfo(function(error, userInfo) {
          $('.navbar .nav').html(panda.templates.loggedin(userInfo));
        });
        var view = new noteView({
          model: new Note({id: 'root', type: 'category', name: 'Home'})
        });
        $('.content').html(view.render().el);
      }
    },

    login: function() {
      panda.login();
    },

    logout: function() {
      panda.router.navigate('#!/');
      location.reload();
    },

    view_note: function(nid) {
        var view = new noteView({
          model: panda.notes.get(nid)
        });
        $('.content').html(view.render().el);
    },

    new_note: function(pid) {
      var view = new editNoteView({pid: pid});
      $('.content').html(view.render().el);
    },

    edit_note: function(nid) {
      var model = panda.notes.get(nid);
      var view = new editNoteView({model: model});
      $('.content').html(view.render().el);
    },

    callback: function() {
      panda.login();
    },

    catchall: function(path) {
      console.log('Caught undirected route at ' + path);
      panda.router.navigate('#!/', {trigger: true});
    }
  });

  fetch_templates('./templates.html', function(){
    panda.client.authDriver(new Dropbox.Drivers.Redirect({rememberUser: true}));
    panda.router = new appRouter();
    Backbone.history.start({
      root: window.location.pathname
    });
  });
});
