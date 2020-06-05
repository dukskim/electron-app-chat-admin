const nickname = 'Admin'
const socketServer = 'https://test-mchat.cmsedu.co.kr'
let currentRoomInfo = null
let currNamesapce = null

Handlebars.registerHelper('ifCond', function(v1, v2, options){
  if(v1 == v2) {
    return options.fn(this)
  }
  return options.inverse(this)
})
$(()=>{
  sockm.init({
    fnConnect: () => {
      console.log('connect!!')
    },
    fnRoomchatAdmin: (data) => {
      const inhtml = $('#chat-send-template').html()
      const template = Handlebars.compile(inhtml)
      const innerHtml = template({msg:data.msg, time:data.time})
      $('#addMessage').append(innerHtml)
      $('#chat_view').animate({scrollTop: $("#chat_view")[0].scrollHeight}, 100)
      console.log('roomchatAdmin : '+data)
    },
    fnRoomchat: (data) => {
      const inhtml = $('#chat-rev-template').html()
      const template = Handlebars.compile(inhtml)
      const innerHtml = template({msg:data.msg, time:data.time})
      $('#addMessage').append(innerHtml)
      $('#chat_view').animate({scrollTop: $("#chat_view")[0].scrollHeight}, 100)
      console.log('roomchat : '+data)
    },
    fnDisconnect: () => {
      console.log('disconnect')
    },
    fnRoomInfo: (data) => {
      console.log('roomInfo : '+JSON.stringify(data))
      const activeRoom = $('.person.focus').attr('data-room')
      console.log('activeRoom::: ' + activeRoom)
      let inhtml = $('#roomlist-template').html()
      let template = Handlebars.compile(inhtml)
      if (data[activeRoom]) {
          data[activeRoom].isActive = true
          currentRoomInfo = data[activeRoom]
          //disabledToggle(data[activeRoom].isUserOnline ? false : true)
      }
      let innerHtml = template({roomInfo:data})
      $('#roomlist').html(innerHtml)
    },
    fnImageUser: (data) => {
      console.log("imageUser")
      const inhtml = $('#chat-rev-img-template').html()
      const template = Handlebars.compile(inhtml)
      const innerHtml = template({msg:data.msg, time:data.time})
      $('#addMessage').append(innerHtml)
      $('#chat_view').animate({scrollTop: $("#chat_view")[0].scrollHeight}, 100)
    },
    fnImageAdmin: (data) => {
      console.log("imageAdmin")
      const inhtml = $('#chat-send-img-template').html()
      const template = Handlebars.compile(inhtml)
      const innerHtml = template({msg:data.msg, time:data.time})
      $('#addMessage').append(innerHtml)
      $('#chat_view').animate({scrollTop: $("#chat_view")[0].scrollHeight}, 100)
    },
    fnRoomcreate: (data) => {
      try {
        notify(data)
      } catch (error) {
      }
    },
    socketServer: socketServer
  })


  // 소켓 시작버튼
  $("#nameselect").on('change', function(){
    const namespace = $(this).val()
    if (!namespace) {
      if(currNamesapce){
        leaveRoom()
        closeSocket()
      }
      currNamesapce = namespace
      return
    }
    currNamesapce = namespace
    startSocket(namespace)
  })

  $('#btnInMessage').on('click', () => {
    const msg = $('#inMessage').val()
    sendAdminMessage(msg)
  })

  $('#inMessage').on('keyup', function(key){
    if (key.keyCode == 13) {
      const msg = $(this).val()
      sendAdminMessage(msg)
    }
  })
 
  // 이미지 전송 Listen to file input events
  $('#chatfile').on('change', function(event){
    //document.getElementById("chatfile").addEventListener("change", function (event) {
    //var output = document.getElementById("output");
    // Prepeare file reader
    const file = event.target.files[0]
    //var imgFile = $('#chatfile').val();
    const imgFile = $(this).val()
    const fileForm = /(.*?)\.(jpg|jpeg|png|gif|bmp|pdf)$/
    const fileReader = new FileReader()
    if (file == null) {
      return
    }
    if (!(imgFile.toLowerCase()).match(fileForm)){
      alert("이미지 파일만 전송이 가능합니다.")
      const agent = navigator.userAgent.toLowerCase()
      if ( (navigator.appName == 'Netscape' && navigator.userAgent.search('Trident') != -1) || (agent.indexOf("msie") != -1) ){
        $("#chatfile").replaceWith( $("#chatfile").clone(true) )
      } else { 
          // other browser 일때 input[type=file] init. 
          $("#chatfile").val("")
      }
      return
    }
    fileReader.onloadend = function (event) {
      // // Send an image event to the socket
      // var image = event.target.result;
      // //output.src = image;
      // console.log('socket.emit.emit("image", image);');
      // socket.emit("image", image);
      sendImage(event)
    }

    // Read file
    fileReader.readAsDataURL(file);
  })
  
  const systemShowMessage = (msg) => {
    //if(!msg) msg = '상담을 대기중입니다. 잠시만 기다려주세요 ...';
    //var inhtml = $('#chat-system-template').html();
    //var template = Handlebars.compile(inhtml);
    //var innerHtml = template({msg:msg});
    //$('#addMessage').append(innerHtml);
    //$('#chat_view').animate({scrollTop: $("#chat_view")[0].scrollHeight}, 100);
  }

  const disabledToggle = (isDisabled) => {
    console.log("isDisabled::: "+isDisabled)
    if(isDisabled){
      $('#inMessage').attr('disabled', 'disabled')
      $('#btnInMessage').attr('disabled', 'disabled')
      //$('#chatfile').attr('disabled', 'disabled')
    } else {
      $('#inMessage').removeAttr('disabled')
      $('#btnInMessage').removeAttr('disabled')
      //$('#chatfile').removeAttr('disabled')
    }
  }
})

const startSocket = (namespace) => {
  $('#addMessage').empty()
  leaveRoom()
  closeSocket()
  sockm.startSocket(namespace)
}
const leaveRoom = () => {
  sockm.leaveRoom()
  $('#userName').empty();
  $('#addMessage').empty();
  //$('#inMessage').val('');
  chatCommentList = [];
  currentRoomInfo = null;
}
const joinRoom = (roomid, nickname) => {
  sockm.joinRoom(roomid, nickname)
}
const closeSocket = () => {
  sockm.closeSocket()
  $('#roomlist').empty()
}
const sendAdminMessage = (msg) => {
  if (!msg) return
  sockm.sendAdminMessage(msg)
  $('#inMessage').val('')
}
const sendImage = (event) => {
  const image = event.target.result
  sockm.sendImage(image)
}
const notify = (data) => {
  //if (Notification.permission !== 'granted') {
      //alert('notification is disabled');
  //} else {
      const notification = new Notification('상담 요청', {
          //icon: '/assets/img/avatars/student.png',
          body: '['+data.roomname+'] 님께서 상담을 요청하였습니다.',
      });
      notification.onclick = () => {
          //window.open('about:blank').location.href='/admin/chat/'+namespace;
      }
  //}
}
let dd = null
const changeRoom = (_this) => {
  if($(_this).hasClass('focus')) return
  //const result = confirm("채팅방에 입장하시겠습니까? \n채팅을 나갈 경우 저장된 내용이 삭제됩니다. 이동하시겠습니까?")
  //if(!result) return
  $(_this).toggleClass('focus').siblings().removeClass('focus')
  const dataroom = $(_this).attr('data-room')
  const username = $(_this).attr('data-room-name')
  console.log("dataroom:"+dataroom)
  console.log("username:"+username)
  currentRoomInfo = null
  try {
    leaveRoom()
    $('#userName').empty()
    $('#addMessage').empty()
    joinRoom(dataroom, nickname)
    $('#userName').html(username)
    //$('#inMessage').val('')
  } catch (error) {
  }
  console.log('changeRoom!!!!')
}

const imgPopupView = (_this) => {
  const source = $(_this).attr('src')
  //console.log(soruce)
  //const wnd = window.open("", "new window", "width=600,height=600")
  //wnd.document.write('<img src="'+soruce+'" />');  

  //wnd.onload = () => {
  //  console.log('wnd.onload!!!!!!!!!!!')
  //  wnd.document.write('<img src="'+soruce+'" />')
  //}
  const { remote } = require('electron');
  let child = new remote.BrowserWindow({
    width: 600,
    height: 600,
    parent: remote.getCurrentWindow(),
    webPreferences: {
      nodeIntegration: true
    },
    modal: true,
    show: false,
    autoHideMenuBar: true
  })
  child.loadFile('imagePopup.html')
  child.once('show', () => {
    child.webContents.send('child-image', source)
  })
  child.once('ready-to-show', () => {
    child.show()
  })

}
