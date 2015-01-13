# front-end-assessment2

Requirements
------------

- a modern browser (tested on IE 10, Chome, Firefox)

Concepts illustrated
--------------------

- single-page application
- object-oriented JavaScript
- separation of concerns (basic MVC structure)
- JSON loading and parsing
- error handling
- asynchronous functions including parallel asynchronous functions
- callback functions
- functional programming
- DRY (don't repeat yourself)
- HTML escaping (security)

Solution uses jQuery for HTTP requests and as a selector engine. Plain JavaScript is used for models, controllers, 
and dynamic DOM (views). Webknife (my own CSS framework) is used for the page styles.

Suggested improvements
----------------------

- better view layer (e.g a view framework like React.js or templating engine like Handlebars.js)
- router (allow multiple 'pages' with browser history)
- CommonJS/Browserify (code separation into modules)
- pagination of results
- return key should also trigger the fetch event

For dynamic and single page web apps, the virtual DOM concept in Facebook's [React](http://facebook.github.io/react/) 
and other frameworks like [Mithril](http://lhorie.github.io/mithril/) seem to have a promising future. This is my 
preferred direction over monolithic frameworks like [Angular](https://angularjs.org/) and 
[Ember](http://emberjs.com/).