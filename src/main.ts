import { Socket, io } from "socket.io-client";

import Ball from "./Ball";
import Drawable from "./Drawable";
import Player from "./Player";
import { v4 as uuid } from "uuid";

type GameObject = Map<string, Drawable>;

function main() {
  // Socket connection
  const socket = io(`http://127.0.0.1:3000`, {
    autoConnect: true,
  });

  document
    .querySelector<HTMLButtonElement>("#play")
    ?.addEventListener("click", () => socket.emit("start-game"));

  const gameId = uuid().split("-")[0];
  socket.emit("create-game", gameId);

  const gameIdDOM = document.querySelector<HTMLDivElement>("#game-id");
  if (!gameIdDOM) throw new Error("No Game ID Div");
  gameIdDOM.innerHTML = `Game ID: ${gameId}`;

  document
    .querySelector<HTMLButtonElement>("#join-game")
    ?.addEventListener("click", () => {
      const gameId =
        document.querySelector<HTMLInputElement>("#game-id-value")?.value;

      if (!gameId || gameId === "") {
        console.error("No GameID");
        return;
      }

      socket.emit("join-game", gameId);
    });

  socket.on("joined-game", () => {
    const playerCount = document.querySelector<HTMLDivElement>("#player-count");
    const gameInfoContainer = document.querySelector<HTMLInputElement>(
      "#join-game-container"
    );

    if (!playerCount || !gameInfoContainer)
      throw new Error("DOM element not found");

    gameInfoContainer.style.display = "none";
    playerCount.innerHTML = `Player Count: 2/2`;
  });

  socket.on("started-game", (playerNum: number) => init(playerNum, socket));
}

function init(playerNum: number, socket: Socket) {
  const canvas = document.querySelector<HTMLCanvasElement>("canvas");
  if (!canvas) throw new Error("No Canvas Found");

  canvas.height = 500;
  canvas.width = 1000;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No Context");

  const gameObjects: GameObject = new Map();

  console.log(playerNum);
  const player1 = new Player(ctx, socket, canvas, 1, playerNum === 1);
  const player2 = new Player(ctx, socket, canvas, 2, playerNum === 2);
  gameObjects.set("player1", player1);
  gameObjects.set("player2", player2);
  gameObjects.set(
    "ball",
    new Ball(ctx, canvas, player1, player2, playerNum === 1, socket)
  );

  window.requestAnimationFrame(() => gameLoop(canvas, ctx, gameObjects));
}

function gameLoop(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  gameObjects: GameObject
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  gameObjects.forEach((drawable) => drawable.draw(null));
  window.requestAnimationFrame(() => gameLoop(canvas, ctx, gameObjects));
}

main();
