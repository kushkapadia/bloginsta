//require is node specific
//import is modern syntax of javascript itself
import Search from './modules/search'
import Chat from './modules/chat'
import RegistrationForm from './modules/registrationForm'

if(document.querySelector("#registration-form")){
    new RegistrationForm()
}

if(document.querySelector("#chat-wrapper")){
    new Chat()
}

if(document.querySelector(".header-search-icon")){
    new Search()
}