const socket = io('/zoom/')

// const myPeer = new Peer()

const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001'
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
  console.log(`id:${id}`);
})

const videoGrid = document.getElementById('video-grid')
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {

  // create current user's video
  addVideoStream(myVideo, stream)

  // listen to call from other peers and answer them with stream.
  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  // listen to then event when other user connected
  socket.on('user-connected', userId => {
    console.log('user connected:' + userId)
    connectToNewUser(userId, stream)
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

// when other users are onlined, call them, when they answer, obtain their videosStream and dispaly the videos.
function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    console.log(`userVideoStream: ${userVideoStream}`)
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}