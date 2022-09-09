import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';

//importing models
import { Users } from './models/database.js';
import { Groups } from './models/groups.js';
//
import { fileURLToPath } from 'url';
import path from 'path'
import { dirname } from 'path';
import bcrypt from 'bcrypt';
import session from 'express-session'

import { formatMessage,groupFormatMessage } from './messages.js';
import { nanoid } from 'nanoid'
import {ObjectId} from 'mongodb'

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

//view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'))

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized:false
}));

// SOCKET.IO
import { createServer } from "http";
import { Server } from "socket.io";

const server = createServer(app);
const io = new Server(server)

const botName = 'HamroChat bot'

//Run when client connects
io.on('connection', socket => {
    console.log("new WS connection");
    // listening for createRoom
    socket.on('createRoom', ({id1,id2 }) => {
        let sum1 = 0     //sum for current user
        let sum2 = 0    //sum for contact user 
        console.log("user 1 : "+id1)
        console.log("user 2 : "+id2)
        for (let x of id1) {
            let num = parseInt(x)
            if (num) {
                sum1 += num
            }
        }
        for (let x of id2) {
            let num = parseInt(x)
            if (num) {
                sum2 += num
            }
        }
        console.log(sum1+" and "+sum2)
        let room
        if (sum1 > sum2) {
            room = id1 + id2
        } else {
            room = id2 + id1
        }
        console.log('room is ' + room)

        //joining room
        socket.join(room)

        //Welcome current user
        // socket.emit('message', formatMessage(botName, 'Welcome to the chat app!'));

        //Broadcast when a user connects
        //broadcasts to everyone except the use thats connecting
        socket.broadcast
            .to(room)
            .emit('message', formatMessage(botName, 'User has joined the chat!'));
        //Listen for chat message
        socket.on('chatMessage', (msg,time) => {
            socket.to(room).emit('message', formatMessage(id1, msg,time))
        });

        //Runs when client disconnects
        socket.on('disconnect', () => {
            io.to(room).emit('message', formatMessage(botName, 'User has left the chat!'))
        });
    })
    socket.on('createGroupRoom', async ({uid,gid }) => {
        //room
        const room = gid

        console.log('room is ' + room)
        console.log('the current user is ' + uid)

        const userDetails = await Users.findOne({_id:uid})
        const userName = userDetails.firstName+" "+userDetails.lastName
        // console.log(userDetails)
        //joining room
        socket.join(room)

        //Welcome current user
        // socket.emit('message', formatMessage(botName, 'Welcome to the chat app!'));

        //Broadcast when a user connects
        //broadcasts to everyone except the use thats connecting
        socket.broadcast
            .to(room)
            .emit('message', groupFormatMessage(0,botName,userName+' has joined the chat!')); // XYZ has joined the chat

        //Listen for chat message
        socket.on('chatMessage', msg => {
            socket.to(room).emit('message', groupFormatMessage(userDetails,userName, msg))
        });

        //Runs when client disconnects
        socket.on('disconnect', () => {
            io.to(room).emit('message', groupFormatMessage(0,botName, userName+' has left the chat!'))
        });
    })
})

server.listen(process.env.PORT, () => {
    console.log("Listening on port 3000");
})

// Connecting database
const CONNECTION_URL = process.env.url

mongoose.connect(CONNECTION_URL)
// mongoose.connect('mongodb://localhost:27017/HamroChat')
    .then(() => {
        console.log("Connection open!!");

    })
    .catch(err => {
        console.log("Connection failed!: ");
        console.log(err);
    })

//Sessions
const checkSession = (req,res,next)=>{
    // console.log("Checking session")
    if(req.session.user_id){
        // console.log("session exists")
        return res.redirect("HamroChat-home")
    }
    console.log("session doesnt exists")
    next()
}
const redirectToHome = (req,res,next)=>{
    if(!req.session.user_id){
        console.log('no session, redirecting to home')
        return res.redirect('../')
    }
    next()
}
//Redirection
app.get('/', checkSession,(req, res) => {
    res.render('home')
})
//Login
app.get('/login', checkSession,(req, res) => {
    console.log("here in login")
    const error = req.query
    console.log(error)
    res.render('login', { error });
});
app.get('/register', checkSession,(req, res) => {
    res.render('register');
});
    
app.get('/home', checkSession,(req, res) => {
    res.render('home');
});
//Adding user using email
app.post('/HamroChat-home/',async(req,res)=>{
    const emailToAdd = req.body.email //email retrieved from form
    console.log("The following email is to be added:")
    console.log(emailToAdd)
    //currentUser ID
    const id = req.session.user_id
    const currentUser = await Users.findOne({ _id: id })
    //Check if email is present in the db
    const emailExists = await Users.findOne({ email: emailToAdd })
    if(emailExists){
        // email exists in database, now check if already exists in contacts
        console.log("Email exists in database")
        const currentContacts = currentUser.contacts
        let exist = false;
        for (let x of currentContacts) {
            console.log(x.email)
            if (x.email == emailToAdd) {
                exist = true
                break
            }
        }
        console.log("The email already exists in contacts : ")
        console.log(exist)
        if (exist != true) {
            //pushing/adding email id to current user's contact
            await Users.findOneAndUpdate({ _id: id }, { $push: { contacts: { email: emailToAdd } } })
            //Pushing/adding email id to contact's contact book
            await Users.findOneAndUpdate({ _id: emailExists._id }, { $push: { contacts: { email: currentUser.email } } })
                .then((d) => {
                    console.log("Contact added successfully")
                    // res.redirect("HamroChat-home/" + id)
                    res.redirect('/HamroChat-home/')
                })
                .catch(e => {
                    console.log("Contact not added. Error!")
                })
        } else {
            console.log("contact already exists")
            res.redirect('/HamroChat-home/')
        }
    }else{
        console.log("email not found")
        res.redirect('/HamroChat-home/')
    }
})
app.get('/HamroChat-home/', redirectToHome,async (req, res) => {
    const id = req.session.user_id
    const allUsers = await Users.find({})
    const currentUser = await Users.findOne({ _id: id })
    // if ((Object.keys(req.query).length == 0) == true) {
    // if (currentUser.isOnline != true || req.query.email == null) {
    return res.render('HamroChat-home', { currentUser, allUsers });
    // if (currentUser.isOnline != true) {
    //     await Users.findOneAndUpdate({ _id: id }, { isOnline: true })
    //     // console.log("data is")
    //     // console.log(allUsers)
    //     // console.log(currentUser)
    //     console.log("User logged in")
    // }
});
// Removing contact from user's db
app.post('/HamroChat-user-profile/remove/:cid',async(req,res)=>{
    const {cid} = req.params
    const id = req.session.user_id
    await Users.findOne({_id:cid})
    .then(async contact=>{
        //removing contact from users list
        console.log(contact.email)
        await Users.findOneAndUpdate({_id:id},{$pull:{contacts:{email:contact.email}}})
        .then(async user=>{
            console.log("Contact removed from user's db")
            //removing user from contact's list
            console.log(user.email)
            await Users.findOneAndUpdate({_id:cid},{$pull:{contacts:{email:user.email}}})
            .then(()=>{
                console.log("User removed from contact's db")
                res.redirect('/HamroChat-home')
            })
            .catch(e=>{
                console.log(e)
            })
        })
        .catch(e=>{
            console.log(e)
        })
    })
    .catch(e=>{
        console.log(e)
    })
})
// User's profile page
app.get('/HamroChat-profile',async(req,res)=>{
    const id = req.session.user_id
    await Users.findOne({_id:id})
    .then(user=>{
        res.render('HamroChat-profile',{user})
    })
})
//Groups page
app.get('/HamroChat-groups/',redirectToHome,async(req,res)=>{
    const id = req.session.user_id
    const currentUser = await Users.findOne({ _id: id })
    const allGroups = await Groups.find({})
    res.render("HamroChat-groups",{currentUser,allGroups})
})
app.get('/HamroChat-groups/join/',redirectToHome,async(req,res)=>{
    const id = req.session.user_id
    const currentUser = await Users.findOne({ _id: id })
    res.render("HamroChat-join-group",{currentUser})
})
app.post('/HamroChat-groups/join',async(req,res)=>{
    const id = req.session.user_id
    const currentUser = await Users.findOne({ _id: id })
    const groupId = req.body.groupId
    const groupExists = await Groups.findOne({group_id:groupId})
    if(groupExists){
        //if group exists, check if user arleady in group
        let userAlreadyInGroup = false
        for(let x of currentUser.groups){
            if(x.group==groupId){
                userAlreadyInGroup=true
                break
            }
        }
        //if user not in group, add user to group
        if(!userAlreadyInGroup){
            await Users.findOneAndUpdate({_id:id},{$push:{groups:{group:groupId}}})
            .then(async user=>{
                //Add user id to group db
                await Groups.findOneAndUpdate({group_id:groupId},{$push:{users:{user:user._id}}})
                .then(result=>{
                    console.log("Group joined successfully")
                    res.redirect('/HamroChat-groups')
                })
                .catch(e=>{
                    console.log(e)
                })
            })
            .catch(e=>{
                console.log(e)
            })
        }else{
            console.log("user already in group")
            return res.redirect('/HamroChat-groups')
        }
    }else{
        console.log("group doesnt exist")
        res.redirect('/HamroChat-groups')
    }
})
app.get('/HamroChat-groups/create/',redirectToHome,async(req,res)=>{
    const id = req.session.user_id
    const currentUser = await Users.findOne({ _id: id })
    res.render("HamroChat-create-group",{currentUser})
})
app.post('/HamroChat-groups/create/',async(req,res)=>{
    const id = req.session.user_id
    const groupName = req.body.group_name
    //generate unique group id and ensure no group has same id
    let groupId
    while(1){
        groupId = nanoid(11)
        const res = await Groups.findOne({group_id:groupId})
        if(!res){
            break
        }
    }
    console.log("group id is ")
    console.log(groupId)
    //saving to database
    await Users.findOneAndUpdate({ _id: id }, { $push: { groups: { group: groupId } } })
    const newGroup = new Groups({
        admin:id,
        group_name: groupName,
        group_id:groupId,
        users:{
            user:ObjectId(id)
        }
    })
    console.log("new group is")
    console.log(newGroup)
    await newGroup.save()
    .then(d=>{
        console.log("The data saved is ")
        console.log(d)
        res.redirect('/HamroChat-groups/')
    })
    .catch(e=>{
        console.log("Error faced in adding data")  
        console.log(e)
    })
})
// Group details
app.get('/HamroChat-group-profile/:gid',redirectToHome, async(req,res)=>{
    const id = req.session.user_id
    const {gid} = req.params
    await Groups.findOne({_id:gid})
    .then(async (groupData)=>{
        let userInGroup=false
        await Users.findOne({_id:id})
        .then(async data=>{
            for(let x of data.groups){
                if(x.group==groupData.group_id){
                    userInGroup=true
                    break
                }
            }
            if(userInGroup){
                let admin = false
                if(groupData.admin == id){
                    console.log("admin")
                    admin = true
                }
                const adminData = await Users.findOne({_id:groupData.admin})
                const allUsers = await Users.find({})
            res.render('HamroChat-group-profile',{id,admin,adminData,groupData,allUsers})
            }else{
                console.log("User not in group!")
                return res.redirect('HamroChat-groups')
            }
        })

    })
    .catch(e=>{
        return res.redirect('/HamroChat-groups')
        console.log('error')
        // console.log(e)
    })
})
app.post('/HamroChat-group-profile/add/:gid',async(req,res)=>{
    const {gid} = req.params
    const emailToAdd = req.body.email
    console.log("The following email is to be added:")
    console.log(emailToAdd)
    //currentUser ID
    //Check if email is present in the db
    const emailExists = await Users.findOne({ email: emailToAdd })
    if(emailExists){
        // email exists in database, now check if already exists in group
        console.log("Email exists in database")
        // const emailExistsInGroup = await Groups.findOne({users : {user:emailExists._id}})
        let emailExistsInGroup=false
        const groupData = await Groups.findOne({_id:gid})
        for(let x of groupData.users){
            if(x.user.equals(emailExists._id)){
                emailExistsInGroup=true
                break
            }
        }
        if (emailExistsInGroup==false) {
            //pushing/adding group id to new user's contact
            await Users.findOneAndUpdate({ _id: emailExists._id }, { $push: { groups: { group:groupData.group_id  } } })
            //Pushing/adding user id to group's list of users
            await Groups.findOneAndUpdate({ _id: gid }, { $push: { users: { user: emailExists._id } } })
                .then((d) => {
                    console.log("Contact added successfully")
                    res.redirect('/HamroChat-group-profile/'+gid)
                })
                .catch(e => {
                    console.log("Contact not added. Error!")
                })
        } else {
                console.log("The email already exists in group")
                res.redirect('/HamroChat-group-profile/'+gid)
        }
    }else{
        console.log("email not found")
        res.redirect('/HamroChat-group-profile/'+gid)
    }
})
app.post('/HamroChat-group-profile/delete/:gid',async(req,res)=>{
    const {gid} = req.params
    const uid = ObjectId(req.body.uid_delete)
    console.log("deleting id ")
    console.log(uid)
    await Groups.findOneAndUpdate({_id:gid}, {$pull: { users : { user : uid } }})
    .then(async groupData => {
        console.log("removed from groups")
        await Users.findOneAndUpdate({_id:uid}, {$pull: { groups : { group : groupData.group_id } }})
        .then(result=>{
            console.log("removed from user data")
            res.redirect('/HamroChat-group-profile/'+gid)
        })
        .catch(e=>{
            console.log(e)
        })
    })
    .catch(e => {
        console.log('error')
        console.log(e)
    })
})
// Group chat
app.get('/HamroChat-group-message/:gid',redirectToHome,async(req,res)=>{
    const { gid } = req.params //group id from parameter
    const id = req.session.user_id
    const groupData = await Groups.findOne({group_id : gid })
    if(groupData){
        // console.log(groupData)
        const currentUser = await Users.findOne({_id : id })
        // const currentUser = await Users.findOne({ _id: id })
        for(let x of currentUser.groups){
            if(x.group==gid){
                return res.render('HamroChat-group-message', { currentUser, groupData })
            }
        }
    }
    console.log("user not in group or No such group exist")
    return res.redirect('/HamroChat-groups')
})
app.post('/HamroChat-group-profile/deleteGroup/:gid',async (req,res)=>{
    const {gid} = req.params
    const groupdToDelete = await Groups.findOne({_id:gid})
    const allUsers = await Users.find({})
    console.log("all users are")
    for(let user of allUsers){
        console.log(user)
        for(let group of user.groups){
            if(group.group==groupdToDelete.group_id){
                console.log("deleting group : "+group.group)
                console.log("deleting group : "+groupdToDelete.group_id)
                console.log("deleting group from user : "+user._id)
                await Users.findOneAndUpdate({_id:user._id},{$pull:{groups:{group:group.group}}})
                .then(async d=>{
                    console.log("Group successfully deleted from user DB")
                })
                .catch(e=>{
                    // console.log(e)
                })
            }
        }
    }
    await Groups.findOneAndDelete({_id:gid})
    .then(d=>{
        console.log("Group successfully deleted")
        res.redirect('/HamroChat-groups')
    })
    .catch(e=>{
        console.log(e)
    })
})
app.post('/HamroChat-group-profile/exit/:gid',async (req,res)=>{
    const {gid} = req.params
    const id = req.session.user_id
    const groupData = await Groups.findOne({_id:gid})
    await Users.findOneAndUpdate({_id:id},{$pull:{groups:{group:groupData.group_id}}})
    .then(async d=>{
        console.log("Group deleted from user DB")
        await Groups.findOneAndUpdate({_id:gid},{$pull:{users:{user:d._id}}})
        .then(result=>{
            console.log("User removed from group")
            res.redirect('/HamroChat-groups')
        })
    })
    .catch(e=>{
        console.log(e)
    })

})
app.get('/HamroChat-user-profile/:id2/',redirectToHome, async (req, res) => {
    const { id2} = req.params
    const id = req.session.user_id
    const contactUser = await Users.findById({ _id: id2 })
    res.render('HamroChat-user-profile', { contactUser })
})
app.get('/HamroChat-message/:id2',redirectToHome,async (req, res) => {
    const { id2 } = req.params
    const id = req.session.user_id
    const contactUser = await Users.findById({ _id: id2 })
    // console.log(contactUser)
    const currentUser = await Users.findOne({ _id: id })
    res.render('HamroChat-message', { currentUser, contactUser })
})
//Changing credentials
app.get('/change-credentials/',redirectToHome,async (req, res) => {
    const id = req.session.user_id
    const currentUser = await Users.findOne({ _id: id })
    res.render('change-credentials',{currentUser})
})
app.post('/change-credentials/',async (req, res) => {
    const id = req.session.user_id
    const newPass = req.body.pass2
    await Users.findOneAndUpdate({ _id: id },{password:newPass})
    await Users.findOneAndUpdate({ _id: id }, { isOnline: false })
        .then(d => {
            req.session.destroy() //destroying session
            res.redirect('/home?passwordChange=successful')
        })
    // res.render('change-credentials',{currentUser})
})
app.get('/contact/',redirectToHome, async(req, res) => {
    const id = req.session.user_id
    res.render('contact')
})
//logout
app.post('/home', async (req, res) => {
    console.log("inside home")
    const id = req.session.user_id
    await Users.findOneAndUpdate({ _id: id }, { isOnline: false })
    .then(d => {
        req.session.destroy() //destroying sessions
        res.redirect('/home?logout=successful')
    })
    // res.render("home")
})
app.post("/register", async (req, res)=> {
    const email = req.body.email
    const emailExists = await Users.findOne({ email })
    if(!emailExists){
        //no existing email already registered
        const fName = req.body.first
        const lName = req.body.last
        const dob = req.body.dob
        const gender = req.body.genders
        const age = req.body.age
        const password = req.body.pass2

        const hashedPw = await bcrypt.hash(password,12)

        const newUser = new Users({
            firstName: fName,
            lastName: lName,
            email: email,
            Age: age,
            DOB: dob,
            gender: gender,
            password: hashedPw,
            isOnline: false,
        })
        console.log("new data is")
        console.log(newUser)
        await newUser.save()
        .then(d=>{
            console.log("The data saved is ")
            console.log(d)
            res.redirect('login?registration=successful')
        })
        .catch(e=>{
            console.log("Error faced in adding data")  
            console.log(e)
        })
        console.log("Saved")
        // res.redirect('login')
    }else{
        console.log("The email already exists")
        res.redirect('register')
    }
})
app.post("/login", async(req, res) => {
    const email = req.body.email
    await Users.findOne({ email: email })
        .then(async(data) => {
            const password = req.body.pass
            const isValid = await bcrypt.compare(password,data.password)  
            // if (data.password === password) {
            if (isValid) {
                Users.updateOne({ _id: data._id }, { $set: { isOnline: 'true' } })
                .then(d=>{
                    // console.log(d)
                })
                console.log("User logged in. User is now online")
                req.session.user_id = data._id
                res.redirect("HamroChat-home")
            }
            else {
                res.redirect("login?login=invalid")
                console.log("Incorrect Password");
            }
        })
        .catch(err => {
            res.redirect("login?login=invalid")
            console.log("User not Found!");
            console.log(err)
        })
    });

app.get('/user-Status/:id',async(req,res)=>{
    const {id}=req.params
    console.log('id in status is ')
    console.log(id)
    await Users.findOne({_id:id})
    .then(data=>{
        return data.isOnline;
    })
})
app.get('*',checkSession,(req,res)=>{
    res.redirect('../')
})

