/**
 * Helpers
 */

var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
};

//the moustache.js solution for escaping HTML
function escapeHtml(string) {
    if (string === null) {
        return '';
    } else {
        return String(string).replace(/[&<>"'\/]/g, function (s) {
            return entityMap[s];
        });
    }
};

/**
 * Gist class
 */

function Gist() {

    /**
     * Models
     */

    this.requestUrl = 'https://api.github.com/';

    this.username = '';

    this.result = [];

    //the counter property tracks when all links have been checked
    this.counter = 0;

    /**
     * Controllers
     */

    this.load = function() {
        var self = this;
        $.getJSON( this.requestUrl+'users/'+this.username+'/gists' )
            .done(function( result ) {
                self.result = result;
                self.loadForks();
            })
            .fail(function( jqxhr, textStatus, error ) {
                console.log( 'Error loading data ('+textStatus + "). " + error);
            });
    };

    this.loadForks = function () {
        var self = this;
        this.counter = 0; //reset
        this.result.forEach(function (gist, index) {

            $.getJSON( gist.forks_url+'?page=1&per_page=3' ) //limit to 3 forks
                .done(function( data ) {
                    self.counter += 1;
                    self.result[index].forks = data;

                    if (self.completed()) {
                        self.draw();
                    }
                })
                .fail(function( jqxhr, textStatus, error ) {
                    console.log( 'Error loading data ('+textStatus + "). " + error);
                });

        });
    };

    //the completed method checks whether all asynchronous link requests have completed
    this.completed = function () {
        var result = false;
        if (this.counter >= this.result.length-1) {
            result = true;
        }
        return result;
    };

    this.fetch = function () {
        this.username = $('#username').val();
        this.load();
    };

    /**
     * Views
     */

    this.draw = function (type) {

        var html = [], i = -1;
        html[++i] = '<p>Gists for username <strong>'+escapeHtml(this.username)+'</strong>:</p>';

        html[++i] = '<table class="w-table w-fixed w-stripe">'
        html[++i] = '<thead><tr><th>Name</th><th>Filetype</th><th>Fork</th></tr></thead>';
  
        this.result.forEach(function (gist) {

            var files = [];

            for (var file in gist.files) {
                var name = file;
                var type = gist.files[file].type;
                var url = gist.files[file].raw_url;
                files.push({
                    'name' : name,
                    'type' : type,
                    'url' : url
                });
            }

            html[++i] = '<tr><td><ul>';
            files.forEach (function (file) {
                html[++i] = '<li><a href="'+escapeHtml(file.url)+'">'+escapeHtml(file.name)+'</a></li>';
            });
            html[++i] = '</ul></td><td><ul>';
            files.forEach (function (file) {
                html[++i] = '<li><span>'+escapeHtml(file.type)+'</span></li>';
            });   
            html[++i] = '</ul></td>';

            html[++i] = '<td><ul>';
            if (gist.hasOwnProperty('forks')) {
                gist.forks.forEach(function (fork) {
                    html[++i] = '<li>';
                    html[++i] = '<img src="'+escapeHtml(fork.owner.avatar_url)+'" class="avatar">';
                    html[++i] = ' <a href="'+escapeHtml(fork.owner.html_url)+'">'+escapeHtml(fork.owner.login)+'</a></li>';
                });
            }
            html[++i] = '</ul></td>';

            html[++i] = '</tr>';
        });
        html[++i] = '</tbody></table>';

        $('#result').html(html.join(''));       
    };

    /**
     * Event Handlers
     */

    $('section').on('click', '#search', this.fetch.bind(this));
};


$( document ).ready(function() {

    var gist = new Gist();

});