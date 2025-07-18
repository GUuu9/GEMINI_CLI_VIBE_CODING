import express, { Request, Response } from 'express';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  const username = req.query.username || 'User';
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>TYPESCRIPT_VIBE</title>
        <link rel="icon" href="/favicon.ico" type="image/x-icon">
        <style>
          body { font-family: sans-serif; transition: background-color 0.5s; overflow: hidden; background-color: #0A3D0A; }
          #logoutButton { position: absolute; top: 10px; right: 10px; padding: 0.5rem 1rem; font-size: 0.8rem; cursor: pointer; background-color: black; color: white; border: none; border-radius: 5px; }
          #logoutButton:hover { background-color: #333; }
          #userList { position: absolute; top: 10px; left: 10px; font-size: 0.9rem; color: #333; padding: 10px; border: 1px solid #ccc; background-color: #f9f9f9; border-radius: 5px; width: 200px; z-index: 100; }
          #userList h3 { margin-top: 0; margin-bottom: 5px; font-size: 1rem; color: #555; }
          #userList table { width: 100%; border-collapse: collapse; }
          #userList th, #userList td { padding: 5px; border-bottom: 1px solid #eee; text-align: left; }
          #userList td:nth-child(2) { text-align: right; }
          #userList th { background-color: #e0e0e0; }
          #userList tr:last-child td { border-bottom: none; }
          .star { position: absolute; width: auto; height: 30px; transition: left 0.05s linear, top 0.05s linear; text-align: center; }
          .star-username { position: absolute; top: 35px; left: 50%; transform: translateX(-50%); color: black; font-weight: bold; white-space: nowrap; }
          #stars-container { position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; }
          #world-background { position: absolute; background-color: #1A521A; /* 이동 가능 영역 색상 */ width: 3000px; height: 3000px; /* WORLD_WIDTH, WORLD_HEIGHT와 동일하게 설정 */ }
          .world-object { position: absolute; z-index: 1; }
          #chat-container { position: absolute; bottom: 0; left: 0; width: 350px; height: 300px; background: rgba(255, 255, 255, 0.9); border: 1px solid #ddd; border-radius: 10px; display: flex; flex-direction: column; overflow: hidden; min-width: 250px; min-height: 150px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); }
          #chat-container.minimized { height: 40px; min-height: 40px; }
          #chat-header { padding: 10px 15px; background: #4CAF50; color: white; border-top-left-radius: 9px; border-top-right-radius: 9px; display: flex; justify-content: space-between; align-items: center; font-weight: bold; }
          #minimize-button { background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; margin-left: 10px; line-height: 1; padding: 0; }
          .speech-bubble { position: absolute; background-color: #f9f9f9; border: 1px solid #ccc; border-radius: 5px; padding: 5px 10px; font-size: 0.8em; white-space: pre-wrap; z-index: 10; opacity: 0; transition: opacity 0.3s; bottom: 35px; left: 50%; transform: translateX(-50%); max-width: 150px; }
          .speech-bubble::after { content: ''; position: absolute; bottom: -5px; left: 50%; transform: translateX(-50%) rotate(45deg); width: 10px; height: 10px; background-color: #f9f9f9; border-right: 1px solid #ccc; border-bottom: 1px solid #ccc; }
          #opacity-slider { margin-left: 10px; -webkit-appearance: none; appearance: none; height: 5px; background: #f0f0f0; outline: none; opacity: 0.7; transition: opacity .2s; border-radius: 5px; }
          #opacity-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 15px; height: 15px; border-radius: 50%; background: #007bff; cursor: pointer; }
          #opacity-slider::-moz-range-thumb { width: 15px; height: 15px; border-radius: 50%; background: #007bff; cursor: pointer; }
          #messages { list-style-type: none; margin: 0; padding: 10px; overflow-y: auto; flex-grow: 1; background: #fdfdfd; border-bottom: 1px solid #eee; }
          #messages li { padding: 8px 12px; font-size: 0.85em; border-bottom: 1px solid #eee; }
          #messages li:last-child { border-bottom: none; }
          #messages li:nth-child(odd) { background: #f9f9f9; }
          #chat-form { display: flex; padding: 10px; background: #fff; border-top: 1px solid #eee; }
          #chat-input { flex-grow: 1; padding: 10px; border: 1px solid #ddd; border-radius: 5px; margin-right: 10px; font-size: 0.9em; }
          #chat-form button { padding: 10px 15px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 0.9em; }
          #chat-form button:hover { background-color: #0056b3; }
        </style>
      </head>
      <body>
        
        <div id="userList">
          <h3>Connected Users:</h3>
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody id="userListBody">
            </tbody>
          </table>
        </div>
        <div id="stars-container"><div id="world-background">
            <div class="world-object" style="top: 200px; left: 500px; background-color: #8B4513; width: 100px; height: 100px;"></div>
            <div class="world-object" style="top: 800px; left: 1200px; background-color: #228B22; width: 150px; height: 80px; border-radius: 10px;"></div>
            <div class="world-object" style="top: 1500px; left: 200px; background-color: #4682B4; width: 70px; height: 70px; border-radius: 50%;"></div>
            <div class="world-object" style="top: 2500px; left: 2500px; background-color: #FFD700; width: 60px; height: 60px; transform: rotate(45deg);"></div>
        </div></div>
        <button id="logoutButton">Logout</button>

        <div id="chat-container">
          <div id="chat-header"><span>Chat</span><input type="range" id="opacity-slider" min="0.1" max="1" step="0.1" value="1"><button id="minimize-button">_</button></div>
          <ul id="messages"></ul>
          <form id="chat-form" action="">
            <input id="chat-input" autocomplete="off" />
          </form>
        </div>

        <script>
          const currentUsername = "${username}";
        </script>
        <script src="/socket.io/socket.io.js"></script>
        <script src="/js/dist/users.js"></script>
      </body>
    </html>
  `);
});

export default router;