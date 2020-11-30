var socket = io();
let cur_player = "";
let yourturn;
let gameOver = false;
let room_code = "";
let allusers;

let cells = Array.from(document.querySelectorAll("td"));
let winner = "";
let winCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

function checkWinner(arr, curPlayer) {
    arr.forEach(function (subArr) {
        let counter = 0;
        subArr.forEach(function (elem) {
            if (cells[elem].innerHTML === curPlayer) {
                counter++;
                if (counter == 3) {
                    winner = curPlayer;
                    gameOver = true;
                    // console.log("Game end");
                    socket.emit("gameend", {
                        room_code: room_code,
                        yourturn: yourturn
                    })
                }
            }
        });
    });
}



socket.on("gameend", function (data) {
    gameOver = true;
    alert("Game end winner : " + data.yourturn.username);
})
socket.on("nextplayer", function (data) {
    $(".yourturn").text(data);
})

socket.emit("joinroom", "join room")

socket.on("message", function (data) {
    console.log(data);
})
socket.on("cur_player", function (data) {
    cur_player = data.sign;
    // console.log("Current Player is " + cur_player)
    // console.log(data);
    yourturn = data;

})
socket.on("yourturn", function () {
    yourturn.isAdmin = !yourturn.isAdmin;
    // console.log("Reach here");
})


socket.on("userinfo", function (data) {
    allusers = data;
    // console.log(data);
    room_code = data.room;
    $("#room-code").text(`(${room_code})`);
    if (data.Players.length == 1) {
        document.querySelector(".p-1").textContent = `player 1 : ${data.Players[0].username} sign(X)`;
        document.querySelector(".p-2").textContent = `player 2 : waiting ... `;
    } else if (data.Players.length == 2) {
        document.querySelector(".p-1").textContent = `player 1 : ${data.Players[0].username} Sign (X)`;
        document.querySelector(".p-2").textContent = `player 2 : ${data.Players[1].username} Sign (O)`;
    }
})
socket.on("clicked", function (data) {
    // console.log(data);
    let mm = $(`tr:nth-child(${Number(data.click[1]) + 1 }) td:nth-child(${Number(data.click[0]) + 1})`)
    if (mm.text() === '') {
        mm.text(data.findPlayerd.sign);
    }

})

$("td").click(function () {
    if ($(this).text() === '') {
        if (yourturn.isAdmin && !gameOver && allusers.Players.length == 2) {
            index_clicked = String($(this).index()) + String($(this).parent().index());
            // console.log(index_clicked);
            // console.log(index_clicked);
            socket.emit("clicked", {
                click: index_clicked,
                room_code: room_code
            });
            // console.log(cur_player);

            if ($(this).text() === '') {
                $(this).text(cur_player);
            }


            yourturn.isAdmin = !yourturn.isAdmin;

            socket.emit("yourturn", {
                room_code: room_code,
                yourturn: yourturn
            })

            socket.emit("nextplayer", {
                room_code: room_code,
                yourturn: yourturn
            })

            checkWinner(winCombos, cur_player);
        }
    }
})