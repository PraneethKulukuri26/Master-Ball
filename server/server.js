import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

// In-memory state (demo only)
const players = new Map(); // id -> { x,y,z, vx,vy,vz, t }

io.on('connection', socket => {
  console.log('player connected', socket.id);
  players.set(socket.id, { x:0, y:4, z:0, vx:0, vy:0, vz:0, t: Date.now() });

  // Send current roster
  socket.emit('bootstrap', { id: socket.id, players: Object.fromEntries(players) });
  socket.broadcast.emit('player:join', { id: socket.id, state: players.get(socket.id) });

  socket.on('state:update', data => {
    // Basic trust model (DO NOT use in production without validation)
    players.set(socket.id, { ...data, t: Date.now() });
    socket.broadcast.emit('player:state', { id: socket.id, state: players.get(socket.id) });
  });

  socket.on('disconnect', () => {
    players.delete(socket.id);
    socket.broadcast.emit('player:leave', { id: socket.id });
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => console.log('Server listening on', PORT));
