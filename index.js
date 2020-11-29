const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');
const mongoose = require("mongoose")
const UserSchema =require("./schema/userSchema")
const BoardSchema = require("./schema/boardSchema")

mongoose.connect("mongodb+srv://vimal-db:vimal4757@cluster0.bnowb.mongodb.net/users?retryWrites=true&w=majority",{useNewUrlParser:true, useUnifiedTopology: true},()=>{
  console.log("db connected");
})

const app = express();
const server = http.createServer(app);
const io = socketio(server);
// connecting front and back end
app.use(cors()); 
// router for home page
app.get("/", (req, res) => {
  res.send("Server is up and running." ).status(200);
});
const boards = async()=>{
const as = await  new BoardSchema({
  board:[{
      name:"general",
      message:[{
        topic:"work",
        message:["task 1 finished","finish the task 2","task 3 will be given tommorow"]
      },
      {
        topic:"development",
        message:["nav shoould be developed tommorow","table should be given today"]
      }
    ]
    },

    {
      name:"Marketing",
      message:[{
        topic:"social",
        message:["task 1 finished","finish the task 2","task 3 will be given tommorow"]
      },
      {
        topic:"development",
        message:["nav shoould be developed tommorow","table should be given today"]
      }
    ]
    }],
})
const saveChat=await as.save()
// console.log(saveChat)
}
// boards()
// connecting to chat
io.on('connect', (socket) => {
  // user joining room
  
  socket.on('signin', async({ids,name,useremail,password }) => {
    const newUser = await new UserSchema({
      id:ids,
      name:name,
      userEmail:useremail,
      password:password,
      board:["general","Marketing"],
      menuoption:["Home","Board"],
      templates:["Buissness","Design","Education","Marketing","Engineering","HR & Operations","Personal","Productivity","Product Management","Project Management","Sales","support"]
    })
    const saveUser=await newUser.save()
    // console.log(saveUser)
  socket.emit("signedup",(saveUser))    
  });
  socket.on('check', async({name,password }) => {
    // console.log(name,",",password ,"psopops")
    const db = await UserSchema.findOne({userEmail:name})
    // console.log()
    // console.log(db,"lllllll")
    socket.emit('menu',db,password)
  });
  socket.on("getuser",async(id)=>{
    const db = await UserSchema.findOne({_id:id})
    socket.emit("getmenu",db)
  })

  socket.on("join",async(chatroom)=>{
    socket.join(chatroom)
    const db = await BoardSchema.find() 
    const boardmap = db.forEach((e)=>{
        const board = e.board
        const boardname = board.filter((user) => user.name === chatroom)
        // console.log(boardname)
        socket.emit("oldmessage",boardname)
    }) 
  })
  socket.on("addcard",async(values,room)=>{
    console.log(values,room)
    const rooms = room.room
    const db = await BoardSchema.find() 
    const boardmap = db.forEach(async(e)=>{
        const board = e.board
        const boardname = await board.filter((user) => user.name === rooms)

        
        const a =boardname[0].message.push({
          topic:values,
          message:[]
        })
        socket.emit("cardadded",boardname)
      console.log(boardname);

      }) 
  })
  // user disconnect
  socket.on('disconnect', () => {
    
  })
});

const getroom = (e,chatroom) =>{ 
  console.log(e.board)
 
  console.log(boardname)
}

server.listen(process.env.PORT || 3001, () => console.log(`Server has started.`));