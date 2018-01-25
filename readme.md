# Gallery REST API #
Readme alpha version 1.

TBD:
* Unique votes (one user can vote only once for same image)

- - - -

## Endpoints ##

### Home ###
* POST /register [x]
* POST /login [x]

### User ###
* GET /profile [x] 
* GET /mygalleries [x] 
* GET /myimages [x]
* POST /logout []
* POST /resetpassword []
* PUT /edit [x]

### Images ###
* GET /all [x]
* GET /image/:id [x]
* POST /upload [x]
* PUT /image/:id/vote [x]
* PUT /image/:id/edit [x]
* DEL /image/:id [x]

### Gallery ###
 * GET /all [x] 
 * GET /:id [x]
 * POST /addgallery [x]
 * PUT /:id/edit [x]
 * DEL /:id [x]
 * DEL /:id/image/:image_id []

- - - -

## Build with ##
* Node.js + ExpressJS
* MongoDB + Mongoose
* Passport + JWT
