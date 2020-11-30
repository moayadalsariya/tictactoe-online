const express = require("express");
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const mongoose = require("mongoose")
const playerModel = require("./models/player");
const roomSchema = require("./models/room")
const bodyParser = require('body-parser');
var {
    nanoid
} = require("nanoid");
const room = require("./models/room");
const {
    Socket
} = require("dgram");

mongoose.connect('mongodb://localhost:27017/tictactoe', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
app.set("view egnine", "ejs")
app.use(express.static("public"))


// parse application/json
app.use(bodyParser.json())

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}))
let user = {};

app.get("/", (req, res) => {
    res.render("index.ejs");
})

app.post("/", async (req, res) => {
    user.username = req.body.username;
    if (req.body.joinroom === undefined) {
        user.isAdmin = true;
        user.room = nanoid();
        user.sign = "X";
    } else {
        user.isAdmin = false;
        user.room = req.body.joinroom;
        user.sign = "O";
    }
    const room = await roomSchema.create({
        room: user.room
    })
    res.redirect(`/room/${user.room}`)
})

app.get("/room/:id", async (req, res) => {
    try {
        await roomSchema.findOne({
            room: req.params.id
        })

        res.render("tic-tac-toe.ejs")
    } catch (error) {
        console.log(error);
    }

    res.render("tic-tac-toe.ejs")
})

io.on('connection', (socket) => {
    socket.on("joinroom", async () => {
        let playeInfo = await playerModel.create({
            username: user.username,
            socketId: socket.id,
            isAdmin: user.isAdmin,
            sign: user.sign
        })
        let roomInfo = await roomSchema.findOne({
            room: user.room
        })
        if (roomInfo.Players.length <= 1) {
            roomInfo.Players.push(playeInfo)
            socket.join(roomInfo.room);
            await roomInfo.save();
        }

        socket.on("clicked", async function (data) {
            let findedroom = await roomSchema.findOne({
                room: data.room_code
            })
            let findPlayerd = findedroom.Players.find((item) => {
                return item.socketId === socket.id
            })
            socket.broadcast.to(data.room_code).emit("clicked", {
                findPlayerd: findPlayerd,
                click: data.click
            });
        })

        socket.on("gameend", function (data) {
            io.to(data.room_code).emit("gameend", data);
        })
        socket.on("nextplayer", async function (data) {
            let findroom = await roomSchema.findOne({
                room: data.room_code
            })
            findroom.Players.forEach((item) => {
                if (item.socketId === socket.id) {
                    console.log("Pass");
                } else {
                    io.to(data.room_code).emit("nextplayer", item.username);

                }
            })
        })


        socket.emit("cur_player", playeInfo);

        socket.on("yourturn", async function (data) {
            socket.broadcast.to(data.room_code).emit("yourturn", "Reach here");
        })

        socket.broadcast.to(roomInfo.room).emit("message", `${playeInfo.username} is join the chat`);

        io.to(user.room).emit("userinfo", roomInfo);

        user = {};

        socket.on("disconnect", async (reason) => {
            let deletePlayer = await playerModel.deleteOne(({
                socketId: socket.id
            }))
            let deletedRoom = await roomSchema.deleteMany({
                room: roomInfo.room
            })
            console.log(roomInfo);
            console.log(deletePlayer);
        })
    })
})

http.listen(3000, () => console.log("The server is running on port 3000"))