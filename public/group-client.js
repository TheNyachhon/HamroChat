const form = document.querySelector('#send-message-form')
const messageContainer = document.querySelector('#message-content')
const messageInput = document.querySelector('#message-to-send');
const senderUsername = document.querySelector('#sender-username');

const socket = io();

//Message from server
socket.on('message', message => {
    console.log(message)
    outputMessage(message)
    scrollToBottom()
})
function clearMessage() {
    //Clearing input
    messageInput.value = '';
    messageInput.focus();
}
function scrollToBottom() {
    //Scroll down after hitting send
    messageContainer.scrollTop = messageContainer.scrollHeight
}
//Checking for form submission
form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Getting username
    const username = senderUsername.value
    console.log(username)

    //Getting and creating sender container
    const message = messageInput.value;
    console.log(message)
    const messageToSend = document.createElement('div');
    messageToSend.classList.add('message', 'sender');
    const sender = document.createElement('div')
    sender.classList.add('self');

    //Getting and Adding username
    const usernameToAdd = document.createElement('div')
    usernameToAdd.classList.add('message-time')
    usernameToAdd.innerText = username
    sender.appendChild(usernameToAdd)

    //adding message
    const messageToAdd = document.createElement('div')
    messageToAdd.innerText = message;
    sender.appendChild(messageToAdd);


    //Final message
    messageToSend.appendChild(sender)
    console.log(messageToSend)
    messageContainer.append(messageToSend)
    // 
    scrollToBottom()
    clearMessage()
    //Emitting message to server
    socket.emit('chatMessage', message);
})

//Output message to DOM
function outputMessage(message) {
    // console.log(message)
    // if (message.userName == 'HamroChat bot') {
    // alert(message.text)
    // } else {
        // console.log("Receiver side")
        // console.log(message.userName)
        const messageToSend = document.createElement('div');
        messageToSend.classList.add('message', 'receiver');
        const sender = document.createElement('div')
        sender.classList.add('friend');

        // Appending username
        const usernameToAdd = document.createElement('div')
        usernameToAdd.classList.add('message-time')
        // console.log("userDetails")
        // console.log(message.userDetails)
        if(message.userDetails!=0){
            const profileLink = document.createElement('a')
            const url= "/HamroChat-user-profile/"+message.userDetails._id
            profileLink.setAttribute('href',url)
            profileLink.setAttribute('target','_blank')
            profileLink.innerText = message.userName
            usernameToAdd.appendChild(profileLink)
        }else{
            usernameToAdd.innerText = message.userName   
        }
        sender.appendChild(usernameToAdd)

        // appending message
        const messageToAdd = document.createElement('div')
        messageToAdd.innerText = message.text;
        sender.appendChild(messageToAdd)

        messageToSend.appendChild(sender)
        console.log(messageToSend)
        messageContainer.append(messageToSend)
    // }
}