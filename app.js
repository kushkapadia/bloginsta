const express = require('express')
//difference between let and const, is that let can be reassigned
const session = require('express-session')
//npm install connect-mongo
const MongoStore = require('connect-mongo')(session)
//npm install connect-flash
const flash = require('connect-flash')
//npm install marked-->used for safe user generated html
const markdown=require('marked')
const csrf = require('csurf')

const app = express()
const sanitizeHTML = require('sanitize-html')

//To access the data user inputs in form.
app.use(express.urlencoded({extended: false}))
//just a bolierplate code, tells our express server to add the user submitted data to request object.
app.use(express.json())
app.use('/api', require('./router-api'))
//(aoi routw wont use any of tye session data etc. etc. written below)

let sessionOptions = session({
    secret: "JavaScript is sooooooo coooool",
    store: new MongoStore({client: require('./db')}), //now it will not store in memory
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 1000 * 60 * 60 * 24, httpOnly: true} 
})
//Just a boilerplate code, refence form here in future projects. (Have to be written only once)
app.use(sessionOptions)
app.use(flash())

app.use(function(req,res,next){
    //make our markdown function available from our ejs template
    res.locals.filterUserHTML = function(content){
        return sanitizeHTML(markdown(content), {allowedTags:['p', 'br', 'ul', 'ol', 'li', 'strong', 'bold', 'i', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'], allowedAttributes:[]})
    }
    //make all error and succes flash message form all templates
    res.locals.errors = req.flash("errors")
    res.locals.success = req.flash("success")

    //make current user id available on the req object
    if(req.session.user){
        req.visitorId= req.session.user._id
    } else{req.visitorID =0}

    //make user session data available from within view templates
    res.locals.user = req.session.user
    //we are now working with an object that will be now available from within our ejs templates
    
    
    next() //particular functions for routes
})
//use means run this function for every request

const router = require('./router')
//require function in node does 2 things. 1.It executes said files but 2. It also returns whatever that file exports, and that will be saved inside that variable.



app.use(express.static('public'))
//We are telling our express server to make the folder accessible.
//in public folder there are all the files who that we want to show all the visitors of our app. (css, browser.js, etc)
app.set('views', 'views')
//a has to be views, it is an express option(views configeration).b is the folder created for our views.
app.set('view engine', 'ejs')
//The template system we are using is ejs. There are many different options in javascript community
//npm install ejs

app.use(csrf())

app.use(function(req, res, next){
res.locals.csrfToken = req.csrfToken()
next()
})

app.use('/', router)
//a means which url to use this router for. b is router we want to use

app.use(function(err, req, res, next){
if(err){
    if(err.code == "EBADCSRFTOKEN"){
        req.flash('errors', "Cross site request forgery detected.")
        req.session.save(() => res.redirect('/'))
    } else{
res.render("404")
    }
}
})

const server = require('http').createServer(app)

const io = require('socket.io')(server)

//boilerplate code
//integrate expreess session data with socket io
io.use(function(socket, next){
sessionOptions(socket.request, socket.request.res, next)
})


io.on('connection', function(socket) {

 if(socket.request.session.user){
     let user = socket.request.session.user

    socket.emit('welcome', {username: user.username, avatar: user.avatar})

    socket.on('chatMessageFromBrowser', function(data){
        socket.broadcast.emit('chatMessageFromServer', {message:sanitizeHTML(data.message, {allowedTags: [], allowedAttributes: {}}), username: user.username, avatar: user.avatar})
       //socket.broadcast will send the message to any and all the browsers connected except the browser that just sent it.
        //browser -> server  and then server to all the connected broswer
         })   
         //a->event type
 }
})

module.exports = server
