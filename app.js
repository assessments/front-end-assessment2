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

    /**
     * Controllers
     */

    this.load = function() {
        var self = this;
        $.getJSON( this.requestUrl+'users/'+this.username+'/gists' )
            .done(function( result ) {
                self.result = result;
                self.draw();
            })
            .fail(function( jqxhr, textStatus, error ) {
                console.log( 'Error loading data ('+textStatus + "). " + error);
            });
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
        console.log(this.result); 
        this.result.forEach(function (gist) {
            var filename = gist.files['test'].filename;
            var type = gist.files['test'].type;
            html[++i] = '<tr>';
            html[++i] = '<td>'+escapeHtml(filename)+'</td>';
            html[++i] = '<td>'+escapeHtml(type)+'</td>';
            html[++i] = '<td></td>';
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