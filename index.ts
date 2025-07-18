import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import indexRouter from './src/routes/index';
import usersRouter from './src/routes/users';

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = 3000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.use('/', indexRouter);
app.use('/users', usersRouter);

interface User {
  x: number;
  y: number;
  username: string;
}

const users: { [id: string]: User } = {};

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  // When a new user joins, store their data
  socket.on('userJoined', (username: string) => {
    const randomX = Math.floor(Math.random() * (800 - 30)); // Assuming a max width of 800 and star size of 30
    const randomY = Math.floor(Math.random() * (600 - 30)); // Assuming a max height of 600 and star size of 30
    users[socket.id] = { x: randomX, y: randomY, username: username };
    // Send the current list of users to the new user
    socket.emit('currentUsers', users);
    // Broadcast the new user to all other users
    socket.broadcast.emit('userConnected', { id: socket.id, data: users[socket.id] });
  });


  // When a user moves their star, update their position and broadcast it
  socket.on('starMove', (data: { id: string; x: number; y: number }) => {
    if (users[data.id]) {
      users[data.id].x = data.x;
      users[data.id].y = data.y;
      // Broadcast the move to all other users
      io.emit('starMoved', { id: data.id, position: { x: data.x, y: data.y } });
    }
  });

  // When a user disconnects, remove them and broadcast the disconnection
  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
    delete users[socket.id];
    io.emit('userDisconnected', socket.id);
  });

  // When a user sends a chat message, broadcast it to all users
  socket.on('chatMessage', (msg: string) => {
    if (users[socket.id]) {
      io.emit('chatMessage', { id: socket.id, username: users[socket.id].username, message: msg });
    }
  });
});

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
