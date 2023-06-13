const WebSocket = require("ws");

const startTime = Date.now();
const GAME_DURATION = 1800000;

const server = new WebSocket.Server({ port: process.env.PORT || 3001 });

let general = 0,
  alien = 0;

const aliensRaces = ["AWAA", "GOTHA", "KENT", "LYMA", "MARCIANO"];

server.on("headers", (headers) => {
  headers.push("Access-Control-Allow-Origin: *");
  headers.push(
    "Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept"
  );
});

server.on("connection", (socket) => {
  const remainingTime = Math.floor(
    (startTime + GAME_DURATION - Date.now()) / 60000
  );

  if (remainingTime <= 0) {
    socket.send("TEMPO");
    socket.close();
    return;
  }

  const meetingInterval = setInterval(() => {
    server.clients.forEach((client) => {
      client.send("REUNIÃO");
    });
  }, 600000);

  const gameOverTimeout = setTimeout(() => {
    server.clients.forEach((client) => {
      client.send("TEMPO");
      client.close();
    });
  }, GAME_DURATION - (Date.now() - startTime));

  socket.on("message", (message) => {
    if (message.includes("TIPAGEM")) {
      if (!socket.typePlayer) {
        if (general <= 1) {
          socket.send("GENERAL");
          socket.typePlayer = "GENERAL";
          general++;
        } else if (alien <= 2) {
          const random = Math.floor(Math.random() * aliensRaces.length);
          socket.send(
            JSON.stringify({
              tipo: "ALIEN",
              raca: aliensRaces[random],
            })
          );
          socket.typePlayer = "ALIEN";
          alien++;
        } else {
          socket.send("SOLDADO");
          socket.typePlayer = "SOLDADO";
        }
      }
    }
    if (message.includes("HACKEOU_TODOS")) {
      server.clients.forEach((client) => {
        client.send("BLOCK_ALL");
      });
    }
  });

  socket.on("close", () => {
    clearInterval(meetingInterval);
    clearTimeout(gameOverTimeout);
  });
});
