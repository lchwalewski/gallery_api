# Gallery REST API #
Readme alpha version 1.

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
* PUT /edit []

### Images ###
* GET /all [x]
* GET /image/:id [x]
* POST /upload [x]
* POST /image/:id/vote [x]
* PUT /image/:id/edit []
* DEL /image/:id []

### Gallery ###
 * GET /:id/images []
 * POST /addgallery [x]
 * PUT /:id/edit []
 * DEL /:id [x]
 * DEL /:id/image/:image_id []

- - - -

## Build with ##
* Node.js + ExpressJS
* MongoDB + Mongoose
* Passport + JWT
