const socket = io()

// Elements
const $chatForm = document.querySelector('#message-form')
const $sendLocation = document.querySelector('#send-location')
const $chatFormInput = document.querySelector('#chat-message')
const $chatFormButton = document.querySelector('#chat-send')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')
const $arrow = document.querySelector('.arrow')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const user = {
    name: null
}

const toggleSideBar = (x) => {
    $sidebar.classList.toggle('open')
    x.classList.toggle('move')

    

}

const autoScroll = () => {
    // New message elements
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

const addClass = (you) => {
   const messageElement = $messages.lastElementChild

   messageElement.classList = `message${you ? ' message-own' : ' message-other'}`
}

// Listen for emitted message from server
socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format(`kk:mm`)
    })
    $messages.insertAdjacentHTML('beforeend', html)
    
    autoScroll()

})

socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        url: message.link,
        createdAt: moment(message.createdAt).format(`kk:mm`)
    })
    $messages.insertAdjacentHTML('beforeend', html)

    autoScroll()

})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})


// Emit message event to server. Function parameter is used for sending acknowledgement
$chatForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    // disable the form while sending data
    $chatFormButton.setAttribute('disabled', 'disabled')

    const input = e.target.elements.message
    const textMessage = input.value
    
    await socket.emit('sendMessage', { textMessage, user }, (error) => {
        addClass(true)
        // enable form after sending data
        $chatFormButton.removeAttribute('disabled')
        input.value = ''
        input.focus()
        $chatForm.focus()

        if (error) {
            return console.log(error)
        }

        console.log('Delivered')
    })
    
    
})

// Emit location event to server
$sendLocation.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    $locationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        const userLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }
        socket.emit('sendLocation', userLocation, () => {
            addClass(true)
            console.log('Location shared!')
            $locationButton.removeAttribute('disabled')
        })
    })
})



// Emit join room event
socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})






