//This is our blueprint
 /* --------------------------TUTORIAL-----------------
let User = function(){
     
  this.homePlanet = "Earth"  //property
//The new object in contoller creates a new object and since this new object is calling the constructor function, the this keyword is going to be pointing towards the new object.

//When we write this keyword, it means the current object being created (this).homeplanet

}
//Any object that is created using the above constructor function, is going to have a property named Home Planet

User.prototype.jump = function(){

}
//Using the above syntax, js will not need to create a copy of this function once for each new object. Instead any object created using the constructor function, will have access to this function. 

----------------------TUTORIAL END------------*/
//npm install bcryptjs -> for hashing
const bcrypt = require("bcryptjs")
const userCollection = require('../db').db().collection("users")
const validator = require("validator")
//npm install md5
const md5 = require('md5')

let User =function(data, getAvatar){
    this.data = data
    this.errors = []
    if(getAvatar == undefined){getAvatar = false}
    if(getAvatar){this.getAvatar()}
}

User.prototype.cleanUp = function(){
    if(typeof(this.data.username) != "string") {this.data.username = ""}
    if(typeof(this.data.email) != "string") {this.data.email = ""}
    if(typeof(this.data.password) != "string") {this.data.password = ""}

    //Get rid of any bogus properties
this.data = {
    username: this.data.username.trim().toLowerCase(),
    email: this.data.email.trim().toLowerCase(),
    password: this.data.password
}}

User.prototype.validate = function(){
    return new Promise(async (resolve, reject) => {
        if (this.data.username==""){this.errors.push("You Must provide username.")}
        
        if (this.data.password==""){this.errors.push("You Must provide a password.")}
        if((this.data.password.length>0) && (this.data.password.lenth<12)){this.errors.push("Password should atleast be of 12 characters")}
        if(this.data.password.length>50){this.errors.push("Passwords cannot excess 50 characters")}
        if(this.data.username.length>0 && this.data.username.lenth<3){this.errors.push("Username should atleast be of 3 characters")}
        if(this.data.username.length>30){this.errors.push("Username cannot excess 30 characters")}
                            //npm install validator
        if(this.data.username != "" && !validator.isAlphanumeric(this.data.username)){this.errors.push("Usernames can only contain letters and Number")}
        if (!validator.isEmail(this.data.email)){this.errors.push("You Must provide a valid email Address.")}
    //only if username is valid, then check to see if it's already taken.
    if(this.data.username.length>0 && this.data.username.length<31 &&validator.isAlphanumeric(this.data.username)){
        let usernameExists = await userCollection.findOne({username: this.data.username})
        if(usernameExists){
            this.errors.push("That username is already taken")
        }
    }



//only if email is valid, then check to see if it's already taken.
if(validator.isEmail(this.data.email)){
    let emailExists = await userCollection.findOne({email: this.data.email})
    if(emailExists){
        this.errors.push("That Email is already taken")
    }
}
resolve()
})
}
User.prototype.login = function (){
   return new Promise((resolve, reject) => {
    this.cleanUp()
    userCollection.findOne({username: this.data.username}).then((attemptedUser)=>{
        if(attemptedUser && bcrypt.compareSync(this.data.password, attemptedUser.password)){
           this.data = attemptedUser
            this.getAvatar()
            resolve("Congrats")
        } else {
            reject("Invalid Username or Password")    
        }
    }).catch(function(){
        reject("Please try again later")
    })
    //a is object where we tell mongo what we want to find. We trying to find what user just typed in
//b is a function that fineOne will call, once its work has been complete
   })
   //promise is an inbuilt constructor(blueprint).
   //This function it will return a new object that is promise
}

User.prototype.register = function(){

    return new Promise(async (resolve, reject)=> {
        //Step #1: Validate User data
        this.cleanUp()
       await this.validate() //This points towards whatver is calling the function. in this case, the user in usercontroller is going to call.
        //Step #2: Only if there are no validation errors, Then save the user data into a database
     if(!this.errors.length){
         //hash user password
         let salt = bcrypt.genSaltSync(10)
         this.data.password = bcrypt.hashSync(this.data.password,salt)
         //a is the value we want to hash. B is our salt value
        await userCollection.insertOne(this.data)
        this.getAvatar()
         resolve()
     }
     else{
        reject(this.errors)
     }
    })
}

User.prototype.getAvatar = function(){
    this.avatar = `https://gravatar.com/avatar/${md5(this.data.email)}?s=128`
}

User.findByUsername = function(username){
    return new Promise(function(resolve, reject){
        if(typeof(username) != "string"){
            reject()
            return
        }

        userCollection.findOne({username: username}).then(function(userDoc){
            if(userDoc){
                userDoc = new User(userDoc, true)
                userDoc = {
                    _id: userDoc.data._id,
                    username: userDoc.data.username,
                    avatar: userDoc.avatar
                }
                resolve(userDoc)
            } 
            else{
                reject()
            }
        }).catch(function(){
            reject()
        })
    })
}

User.doesEmailExist = function(email){
return new Promise(async function(resolve, reject){
if(typeof(email) != "string"){
resolve(false)
return
}
let user = await userCollection.findOne({email: email})
if(user){
resolve(true)
} else{
resolve(false)
}

})
}

module.exports = User