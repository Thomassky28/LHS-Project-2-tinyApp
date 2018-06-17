# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs.

## Final Product
!['Screenshot of URLs Page'](https://github.com/byeong0430/LHS-Project-2-tinyApp/blob/master/docs/urls-page.png)
!['Screenshot of Update Page'](https://github.com/byeong0430/LHS-Project-2-tinyApp/blob/master/docs/update-page.png)

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

## Dependencies
- Node.js
- `bcrypt`
- `body-parser`
- `cookie-session`
- `express`
- `ejs`
- `request`
- `method-override`

### Getting Started
1. Install all dependicies using the `npm install` command.

```js
npm init
npm install bcrypt body-parser cookie-parser express ejs request method-override
```

2. Run the development web server using the `node express_server.js` command.