"use strict";
function logout() {
    window.location.href = '/';
}
const starsContainer = document.getElementById('stars-container');
const worldBackground = document.getElementById('world-background');
const socket = io();
const WORLD_WIDTH = 3000; // Example large world width
const WORLD_HEIGHT = 1500; // Example large world height
const STAR_SIZE = 30; // Assuming star is 30x30px
let cameraX = 0;
let cameraY = 0;
const users = {};
const userListElement = document.getElementById('userList');
const userListBody = document.getElementById('userListBody');
function updateUserListDisplay() {
    console.log('Updating user list. Current users:', users);
    userListBody.innerHTML = '';
    for (const id in users) {
        const user = users[id];
        const row = document.createElement('tr');
        const timeCell = document.createElement('td');
        const userCell = document.createElement('td');
        const elapsedSeconds = Math.floor((Date.now() - user.connectedTime) / 1000);
        const minutes = Math.floor(elapsedSeconds / 60);
        const seconds = elapsedSeconds % 60;
        timeCell.textContent = `${minutes}m ${seconds}s`;
        userCell.textContent = user.username;
        if (id === socket.id) {
            userCell.textContent += ` (${Math.round(user.x)}, ${Math.round(user.y)})`;
        }
        row.appendChild(userCell);
        row.appendChild(timeCell);
        userListBody.appendChild(row);
    }
}
setInterval(updateUserListDisplay, 1000);
function createStar(id, username, x, y) {
    const star = document.createElement('div');
    star.id = `star-${id}`;
    star.className = 'star';
    // Initial position will be set by updateStarPosition later
    const starUsername = document.createElement('div');
    starUsername.className = 'star-username';
    starUsername.textContent = username;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'gold');
    svg.setAttribute('width', '30px');
    svg.setAttribute('height', '30px');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z');
    svg.appendChild(path);
    const speechBubble = document.createElement('div');
    speechBubble.className = 'speech-bubble';
    star.appendChild(starUsername);
    star.appendChild(svg);
    star.appendChild(speechBubble);
    worldBackground.appendChild(star);
    return star;
}
function updateStarPosition(starElement, worldX, worldY) {
    starElement.style.left = `${worldX}px`;
    starElement.style.top = `${worldY}px`;
}
socket.on('connect', () => {
    console.log('Connected to server');
    socket.emit('userJoined', currentUsername);
});
socket.on('currentUsers', (serverUsers) => {
    for (const id in serverUsers) {
        if (!users[id]) {
            const user = serverUsers[id];
            const star = createStar(id, user.username, user.x, user.y);
            const speechBubble = star.querySelector('.speech-bubble');
            users[id] = { star, username: user.username, speechBubble, x: user.x, y: user.y, connectedTime: Date.now() };
            updateStarPosition(star, user.x, user.y);
        }
    }
    updateUserListDisplay();
});
socket.on('userConnected', (data) => {
    if (!users[data.id]) {
        const star = createStar(data.id, data.data.username, data.data.x, data.data.y);
        const speechBubble = star.querySelector('.speech-bubble');
        users[data.id] = { star, username: data.data.username, speechBubble, x: data.data.x, y: data.data.y, connectedTime: Date.now() };
        updateStarPosition(star, data.data.x, data.data.y);
    }
    updateUserListDisplay();
});
socket.on('userDisconnected', (id) => {
    if (users[id]) {
        worldBackground.removeChild(users[id].star);
        delete users[id];
    }
    updateUserListDisplay();
});
socket.on('starMoved', (data) => {
    if (users[data.id]) {
        users[data.id].x = data.position.x;
        users[data.id].y = data.position.y;
        updateStarPosition(users[data.id].star, data.position.x, data.position.y);
        // If this is my star being moved by another user (pushed),
        // explicitly update my camera to follow it immediately.
        if (data.id === socket.id) {
            const targetCameraX = users[socket.id].x - window.innerWidth / 2 + STAR_SIZE / 2;
            const targetCameraY = users[socket.id].y - window.innerHeight / 2 + STAR_SIZE / 2;
            cameraX = targetCameraX; // Instant update
            cameraY = targetCameraY; // Instant update
            cameraX = Math.max(0, Math.min(cameraX, WORLD_WIDTH - window.innerWidth));
            cameraY = Math.max(0, Math.min(cameraY, WORLD_HEIGHT - window.innerHeight));
            worldBackground.style.transform = `translate(${-cameraX}px, ${-cameraY}px)`;
        }
    }
});
function initializeLocalStarMovement() {
    let x = WORLD_WIDTH / 2; // Start in the middle of the world
    let y = WORLD_HEIGHT / 2;
    const speed = 5;
    const pressedKeys = new Set();
    window.addEventListener('keydown', (e) => { pressedKeys.add(e.key); });
    window.addEventListener('keyup', (e) => { pressedKeys.delete(e.key); });
    function checkCollision(star1, star2) {
        // Collision detection should now use world coordinates
        const rect1 = { left: users[star1.id.replace('star-', '')].x, top: users[star1.id.replace('star-', '')].y, width: STAR_SIZE, height: STAR_SIZE };
        const rect2 = { left: users[star2.id.replace('star-', '')].x, top: users[star2.id.replace('star-', '')].y, width: STAR_SIZE, height: STAR_SIZE };
        return !(rect1.left + rect1.width < rect2.left ||
            rect1.left > rect2.left + rect2.width ||
            rect1.top + rect1.height < rect2.top ||
            rect1.top > rect2.top + rect2.height);
    }
    function gameLoop() {
        if (users[socket.id]) {
            const starElement = users[socket.id].star;
            let dx = 0;
            let dy = 0;
            if (pressedKeys.has('ArrowUp'))
                dy -= speed;
            if (pressedKeys.has('ArrowDown'))
                dy += speed;
            if (pressedKeys.has('ArrowLeft'))
                dx -= speed;
            if (pressedKeys.has('ArrowRight'))
                dx += speed;
            if (dx !== 0 || dy !== 0) {
                let currentX = users[socket.id].x;
                let currentY = users[socket.id].y;
                let newX = currentX + dx;
                let newY = currentY + dy;
                // Boundary checks for the moving star in world coordinates
                newX = Math.max(0, Math.min(newX, WORLD_WIDTH - STAR_SIZE));
                newY = Math.max(0, Math.min(newY, WORLD_HEIGHT - STAR_SIZE));
                // Collision detection and resolution
                for (const id in users) {
                    if (id === socket.id)
                        continue; // Don't check collision with self
                    const otherStar = users[id].star;
                    if (checkCollision(starElement, otherStar)) {
                        const currentStarWorldX = users[socket.id].x;
                        const currentStarWorldY = users[socket.id].y;
                        const otherStarWorldX = users[id].x;
                        const otherStarWorldY = users[id].y;
                        const currentStarRect = { left: currentStarWorldX, top: currentStarWorldY, width: STAR_SIZE, height: STAR_SIZE };
                        const otherStarRect = { left: otherStarWorldX, top: otherStarWorldY, width: STAR_SIZE, height: STAR_SIZE };
                        // Calculate overlap
                        const overlapX = Math.max(0, Math.min(currentStarRect.left + currentStarRect.width, otherStarRect.left + otherStarRect.width) - Math.max(currentStarRect.left, otherStarRect.left));
                        const overlapY = Math.max(0, Math.min(currentStarRect.top + currentStarRect.height, otherStarRect.top + otherStarRect.height) - Math.max(currentStarRect.top, otherStarRect.top));
                        // Determine push direction
                        let pushX = 0;
                        let pushY = 0;
                        if (overlapX > overlapY) { // Vertical overlap is smaller, push horizontally
                            if (currentStarWorldX < otherStarWorldX) { // Current star is to the left of other
                                pushX = -overlapX / 2;
                            }
                            else {
                                pushX = overlapX / 2;
                            }
                            pushY = 0; // No vertical push
                        }
                        else { // Horizontal overlap is smaller, push vertically
                            if (currentStarWorldY < otherStarWorldY) { // Current star is above other
                                pushY = -overlapY / 2;
                            }
                            else {
                                pushY = overlapY / 2;
                            }
                            pushX = 0; // No horizontal push
                        }
                        // Apply push to both stars
                        newX += pushX;
                        newY += pushY;
                        let otherStarNewX = otherStarWorldX - pushX;
                        let otherStarNewY = otherStarWorldY - pushY;
                        // Boundary checks for the pushed star
                        otherStarNewX = Math.max(0, Math.min(otherStarNewX, WORLD_WIDTH - STAR_SIZE));
                        otherStarNewY = Math.max(0, Math.min(otherStarNewY, WORLD_HEIGHT - STAR_SIZE));
                        users[id].x = otherStarNewX;
                        users[id].y = otherStarNewY;
                        updateStarPosition(otherStar, otherStarNewX, otherStarNewY);
                        socket.emit('starMove', { id: id, x: otherStarNewX, y: otherStarNewY }); // Emit for the pushed star
                    }
                }
                // Update users[socket.id].x and users[socket.id].y with the final newX, newY after potential push
                users[socket.id].x = newX;
                users[socket.id].y = newY;
                // Update camera position to keep local star centered
                const targetCameraX = users[socket.id].x - window.innerWidth / 2 + STAR_SIZE / 2;
                const targetCameraY = users[socket.id].y - window.innerHeight / 2 + STAR_SIZE / 2;
                const interpolationFactor = 1; // Camera moves instantly with the star
                cameraX += (targetCameraX - cameraX) * interpolationFactor;
                cameraY += (targetCameraY - cameraY) * interpolationFactor;
                // Ensure camera stays within world bounds
                cameraX = Math.max(0, Math.min(cameraX, WORLD_WIDTH - window.innerWidth));
                cameraY = Math.max(0, Math.min(cameraY, WORLD_HEIGHT - window.innerHeight));
                // Apply camera transform to worldBackground
                worldBackground.style.transform = `translate(${-cameraX}px, ${-cameraY}px)`;
                // Update all star positions based on new camera
                for (const id in users) {
                    updateStarPosition(users[id].star, users[id].x, users[id].y);
                }
                socket.emit('starMove', { id: socket.id, x: newX, y: newY }); // Emit for the moving star
            }
        }
        requestAnimationFrame(gameLoop);
    }
    requestAnimationFrame(gameLoop);
}
const logoutButton = document.getElementById('logoutButton');
if (logoutButton) {
    logoutButton.addEventListener('click', logout);
}
initializeLocalStarMovement();
const chatContainer = document.getElementById('chat-container');
const chatHeader = document.getElementById('chat-header');
const minimizeButton = document.getElementById('minimize-button');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const messages = document.getElementById('messages');
let isMinimized = true;
const originalChatHeight = 300; // Store original height
toggleChatMinimize(); // Apply initial minimized state
function toggleChatMinimize() {
    isMinimized = !isMinimized;
    const currentBottom = chatContainer.offsetTop + chatContainer.offsetHeight; // Calculate current bottom position
    let newTop;
    let targetHeight;
    if (isMinimized) {
        targetHeight = 40;
        newTop = currentBottom - targetHeight;
    }
    else {
        targetHeight = originalChatHeight;
        newTop = currentBottom - targetHeight;
    }
    // Apply boundary checks
    newTop = Math.max(0, newTop); // Ensure it doesn't go above the top of the screen
    newTop = Math.min(newTop, window.innerHeight - targetHeight); // Ensure it doesn't go below the bottom of the screen
    chatContainer.classList.toggle('minimized', isMinimized);
    chatContainer.style.height = `${targetHeight}px`;
    chatContainer.style.top = `${newTop}px`;
}
minimizeButton.addEventListener('click', toggleChatMinimize);
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (chatInput.value) {
        socket.emit('chatMessage', chatInput.value);
        chatInput.value = '';
    }
});
socket.on('chatMessage', (data) => {
    const item = document.createElement('li');
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    item.textContent = `[${timeString}] ${data.username}: ${data.message}`;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
    function wrapText(text, maxLength) {
        let result = '';
        for (let i = 0; i < text.length; i += maxLength) {
            result += text.substring(i, i + maxLength) + '\n';
        }
        return result;
    }
    // Show speech bubble
    if (users[data.id]) { // Use data.id to target the correct star
        const speechBubble = users[data.id].speechBubble;
        speechBubble.textContent = wrapText(data.message, 20);
        speechBubble.style.opacity = '1';
        // Position the speech bubble
        const starRect = users[data.id].star.getBoundingClientRect();
        speechBubble.style.top = `${-speechBubble.offsetHeight - 5}px`; // 5px above the star
        setTimeout(() => {
            speechBubble.style.opacity = '0';
        }, 5000); // Hide after 5 seconds
    }
});
const opacitySlider = document.getElementById('opacity-slider');
opacitySlider.addEventListener('input', (e) => {
    const target = e.target;
    chatContainer.style.opacity = target.value;
});
opacitySlider.addEventListener('mousedown', (e) => {
    e.stopPropagation();
});
opacitySlider.addEventListener('keydown', (e) => {
    // Prevent arrow keys from changing the slider value
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
    }
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        if (chatInput.value === '') {
            toggleChatMinimize();
            chatInput.focus();
            e.preventDefault();
        }
    }
});
