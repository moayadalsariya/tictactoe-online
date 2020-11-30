const mongoose = require("mongoose");
const playerSchema = new mongoose.Schema({
    username: String,
    socketId: String,
    sign:{
        type:String,
        default:"X"
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model("Players", playerSchema);