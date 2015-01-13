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

function Gists() {

    /**
     * Models
     */

    //the API base url
    this.requestUrl = 'https://api.github.com/';

    //the username to search for
    this.username = '';

    //the response object containing gists
    this.result = [];

    //error response, if any
    this.error = null;

    //the counter property tracks when all fork data has been asynchronously received
    this.counter = 0;

    /**
     * Controllers
     */

    //the fetch method invokes a search request
    this.fetch = function () {
        this.username = $('#username').val();
        this.load();
    };

    //the load method retrieves the list of gists from the server
    this.load = function() {
        var self = this;
        this.result = []; //reset
        self.error = null; //reset
        $.ajax({
            url: this.requestUrl+'users/'+this.username+'/gists',
            dataType: "json",
            success: function (data) {
                self.result = data;
                self.loadForks();
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(xhr.status+' : '+thrownError);
                self.drawError(xhr.status+' : '+thrownError);
            }
        });
    };

    //the loadForks method asynchronously retrieves the latest forks for every gist
    this.loadForks = function () {
        var self = this;
        this.counter = 0; //reset

        if (this.result.length > 0) {

            this.result.forEach(function (gist, index) {

                $.ajax({
                    url: gist.forks_url+'?page=1&per_page=3',
                    dataType: "json",
                    success: function (data) {
                        self.counter += 1;
                        self.result[index].forks = data;

                        if (self.completed()) {
                            self.draw();
                        }
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        console.log(xhr.status+' : '+thrownError);
                    }
                });

            });

        } else {
            self.draw();
        }

    };

    //the completed method checks whether all asynchronous fork data requests have completed
    this.completed = function () {
        var result = false;
        if (this.counter >= this.result.length-1) {
            result = true;
        }
        return result;
    };

    //the walkFiles method returns a view-friendly structure with all file metadata
    this.walkFiles = function(gist) {
        var self = this;
        var files = [];
        for (var file in gist.files) {
            files.push({
                'name' : file,
                'type' : gist.files[file].type,
                'language' : gist.files[file].language,
                'color' : self.getColor(gist.files[file].language),
                'url' : gist.files[file].raw_url
            });
        }
        return files;
    }

    /**
     * Views
     *
     * In a larger app, consider a view framework (e.g. React) or template solution (e.g Handlebars.js)
     */

    //the draw method renders the response to the page
    this.draw = function (type) {

        var self = this;
        var html = [], i = -1;

        html[++i] = '<p>Gists for username <strong>'+escapeHtml(this.username)+'</strong>:</p>';
        html[++i] = '<table class="w-table w-fixed w-stripe">'
        html[++i] = '<thead><tr><th>Name</th><th>Filetype</th><th>Fork</th></tr></thead>';
      
        this.result.forEach(function (gist) {

            var files = self.walkFiles(gist);

            html[++i] = '<tr><td><ul>';
            files.forEach (function (file) {
                html[++i] = '<li><a href="'+escapeHtml(file.url)+'">'+escapeHtml(file.name)+'</a></li>';
            });
            html[++i] = '</ul></td><td><ul>';
            files.forEach (function (file) {
                html[++i] = '<li><span class="tag" style="background-color: '+file.color+';">';
                html[++i] = escapeHtml(file.type)+'</span></li>';
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

    //the drawError method displays error information for the user
    this.drawError = function (error) {
        $('#result').html('<p class="w-error">'+escapeHtml(error)+'</p>');
    };

    //the getColor method returns a unique color for the top Github languages (used in tags)
    // http://adambard.com/blog/top-github-languages-2014/
    this.getColor = function (language) {
        switch (language) {
            case 'JavaScript':
                return '#69A9CA';
            case 'Java':
                return '#C76842';
            case 'Ruby':
                return '#68843C';
            case 'C':
                return '#8583C2';
            case 'CSS':
                return '#C06472';
            case 'PHP':
                return '#84D747';
            case 'Python':
                return '#67D1B8';
            case 'C++':
                return '#C99336';
            case 'Objective-C':
                return '#6C7970';
            case 'C#':
                return '#CF74B7';
            case 'Shell':
                return '#CFD14B';
            case 'R':
                return '#78D483';
            default:
                return '#CCC';
        }
    }

    /**
     * Event Handlers
     */

    $('section').on('click', '#search', this.fetch.bind(this));
};


$( document ).ready(function() {

    //Instantiation the Gists class
    var gists = new Gists();

});