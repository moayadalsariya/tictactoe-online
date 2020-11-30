const mongoose = require("mongoose");
const roomSchema = new mongoose.Schema({
    room:String,
    Players: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Players",
        autopopulate:true
    }],
})

roomSchema.plugin(require("mongoose-autopopulate"));


module.exports = mongoose.model("Rooms", roomSchema);