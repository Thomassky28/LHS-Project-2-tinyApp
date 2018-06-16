# LHS Project #2 - TinyApp

## Problem Statement
TinyApp is an application that shortens a long URL with random alphanumeric characters

## Features
Users can
- create short URLs for any web addresses
- update / delete their short URLs
- delete their short URLs
- view when the short URL was created
- view the total number of visit counts
- view the total number of unique visitors for the short URL

The app can
- check if the target URL has any error (i.e.: Error 403, 404) before creating or updating a short URL

## npm
### Package Dependencies
Download the following modules via npm
- `express`
- `request`
- `ejs`
- `body-parser`
- `cookie-session (replaced `cookie-parser`)
- `bcrypt`

### Installation
```js
npm init
npm install express request ejs body-parser cookie-parser bcrypt
```