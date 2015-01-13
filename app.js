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

            var filename = '';
            var type = '';
            var url = '';
            var key = Object.keys(gist.files)[0];
            if (gist.files.hasOwnProperty(key)) {
                filename = gist.files[key].filename;
                url = gist.files[key].raw_url;
                type = gist.files[key].type;
            }

            html[++i] = '<tr>';
            html[++i] = '<td><a href="'+escapeHtml(url)+'">'+escapeHtml(filename)+'</a></td>';
            html[++i] = '<td>'+escapeHtml(type)+'</td>';
            html[++i] = '<td><ul>';

            if (gist.hasOwnProperty('forks')) {
                gist.forks.forEach(function (fork) {
                    html[++i] = '<li>';
                    html[++i] = '<img src="'+fork.owner.avatar_url+'" class="avatar">';
                    html[++i] = ' <a href="'+fork.owner.html_url+'">'+fork.owner.login+'</a></li>';
                });
            }

            html[++i] = '</ul></td></tr>';
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