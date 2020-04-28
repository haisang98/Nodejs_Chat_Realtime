var socket = io("http://localhost:5000/");
//Note: để bắt được sự kiện là class thì xài $(document).on('click','.nameclass',function(){});
//io.to(data).emit()
$(document).ready(function() {
    var info_user = [];
    info_user.push($("#username_user").val());
    info_user.push($("#avatar_user").val());
    socket.emit("Client-Send-Username", info_user);

    socket.on("Server-Send-ArrayUserOnline", function(data) {
        // console.log(data);
        // console.log(data[0].username);
        $(".contacts").html("");
        data.forEach(function(i) {
            $(".contacts").append('<li class="active" socketid="' + i.socketid + '" socketusername="' + i.username + '" socketavatar="' + i.avatar + '"><div class="d-flex bd-highlight"><div class="img_cont"><span class="notification">0</span><img src="/' + i.avatar + '" class="rounded-circle user_img"><span class="online_icon"></span></div><div class="user_info"><span>' + i.username + '</span><p>' + i.username + ' is online</p></div></div></li>');
        });
    });

    $("#logout").click(function() {
        socket.emit("Client-Send-Logout");
        window.location.href = "http://localhost:5000/";
    });

    $(document).on("click", ".active", function() {
        var socket_id = $(this).attr("socketid");
        var socket_username = $(this).attr("socketusername");
        var socket_avatar = $(this).attr("socketavatar");
        $(".nguoi-nhan-msg").html('<div class="img_cont"><img src="/' + socket_avatar + '" class="rounded-circle user_img"><span class="online_icon"></span></div><div class="user_info"><input type="hidden" id="chatvsme" value="' + socket_username + '"><span>Chat with ' + socket_username + '</span><p>1767 Messages</p></div><div class="video_cam"><span><i class="fas fa-video"></i></span><span><i class="fas fa-phone"></i></span></div>');
        $(".submit").click(function() {
            var avatar = $("#avatar_user").val();
            var message = $(".txtmessage").val();
            $(".listmessage").append('<div class="d-flex justify-content-end mb-4"><div class="msg_cotainer_send">' + message + '<span class="msg_time_send">8:55 AM, Today</span></div><div class="img_cont_msg"><img src="/' + avatar + '" class="rounded-circle user-img-msg" width="37" height="37"></div></div>')
            socket.emit("Client-Send-Data", { msg: message, socketid: socket_id });
        });
    });

    socket.on("Server-Send-Message-Of-Sender", function(data) {
        // $(".listmessage").append('<div class="d-flex justify-content-start mb-4"><div class="img_cont_msg"><img src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg" class="rounded-circle user_img_msg"></div><div class="msg_cotainer">' + data.msg + '<span class="msg_time">8:40 AM, Today</span></div></div>')
        $(".contacts li").each(function(index) {
            // console.log( index + ": " + $( this ).text() );
            if ($(this).attr("socketid") == data.socketid && data.count != 0) {
                if ($("#chatvsme").val() == data.socketusername) {
                    socket.emit("Client-Send-Seen");
                    $(".listmessage").append('<div class="d-flex justify-content-start mb-4"><div class="img_cont_msg"><img src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg" class="rounded-circle user_img_msg"></div><div class="msg_cotainer">' + data.msg + '<span class="msg_time">8:40 AM, Today</span></div></div>')
                } else {
                    $(this).find(".notification").css("display", "block").html(data.count);
                    $(this).click(function() {
                        $(this).find(".notification").css("display", "none");
                        socket.emit("Client-Send-Seen");
                        $(".listmessage").append('<div class="d-flex justify-content-start mb-4"><div class="img_cont_msg"><img src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg" class="rounded-circle user_img_msg"></div><div class="msg_cotainer">' + data.msg + '<span class="msg_time">8:40 AM, Today</span></div></div>')
                    });
                }
            }
        });
    });
});