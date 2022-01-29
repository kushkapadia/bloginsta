const express= require('express')
const router = express.Router()
//In this way, express will return an mini application
const userController = require('./controllers/userController')
const postController = require('./controllers/postController')
const followController = require('./controllers/followController')

//User related Routes
router.get('/', userController.home)
router.post('/register', userController.register)
router.post('/login', userController.login)
router.post('/logout', userController.logout)
router.post('/doesUsernameExist', userController.doesUsernameExist)
router.post('/doesEmailExist', userController.doesEmailExist)

//Post related routes
router.get('/create-post',userController.mustBeLoggedIn, postController.viewCreateScreen)
router.post('/create-post', userController.mustBeLoggedIn, postController.create)
router.get('/post/:id', postController.viewSingle)

//: and name is now flexible
router.get('/post/:id/edit', userController.mustBeLoggedIn, postController.viewEditScreen)
router.post('/post/:id/edit', userController.mustBeLoggedIn ,postController.edit)
router.post('/post/:id/delete', userController.mustBeLoggedIn ,postController.delete)
router.post('/search', postController.search)

//profile related routes
router.get('/profile/:username', userController.ifUserExists, userController.sharedProfileData, userController.profilePostsScreen)
router.get('/profile/:username/followers', userController.ifUserExists, userController.sharedProfileData, userController.profileFollowersScreen)
router.get('/profile/:username/following', userController.ifUserExists, userController.sharedProfileData, userController.profileFollowingScreen)


//follow related routes
router.post('/addFollow/:username', userController.mustBeLoggedIn, followController.addFollow )
router.post('/removeFollow/:username', userController.mustBeLoggedIn, followController.removeFollow)

module.exports = router



//------------------Introduction-----------------
// console.log("I am executed")
// module.exports = {
//     name: "Meowsalot",
//     species: "Cat",
//     meow: function(){
//         console.log("Meowww!")
//     }
    
// }
//node.js environment knows what this means, it is on lookout of this special variable. amd whatver we set it to equal, will be returned when we require this file in.
//We are free to export anything we want, a number, an object, etc.