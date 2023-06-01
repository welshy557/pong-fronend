import { Socket } from "socket.io-client";
import Drawable from "./Drawable";

interface PlayerPosition {
  xPos: number;
  yPos: number;
}

export default class Player implements Drawable {
  ctx: CanvasRenderingContext2D;
  socket: Socket;
  playPos: PlayerPosition;
  height: number = 100;
  width: number = 20;
  isPlaying: boolean;
  constructor(
    ctx: CanvasRenderingContext2D,
    socket: Socket,
    canvas: HTMLCanvasElement,
    playerNumber: 1 | 2,
    isPlaying: boolean
  ) {
    this.ctx = ctx;
    this.socket = socket;

    this.playPos = {
      yPos: 0,
      xPos: playerNumber === 1 ? 3 : canvas.width - this.width - 3,
    };
    this.isPlaying = isPlaying;

    if (isPlaying) {
      canvas.addEventListener("mousemove", (e) => {
        this.move(e, canvas);
        this.socket.emit("move-player", this.playPos);
      });
    } else {
      socket.on("moved-player", (playPos: PlayerPosition) => {
        this.playPos = playPos;
      });
    }
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.fillRect(
      this.playPos.xPos,
      this.playPos.yPos,
      this.width,
      this.height
    );
    this.ctx.stroke();
  }

  move(e: MouseEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();

    const yPos = e.clientY - rect.top - this.height / 2;
    if (yPos > canvas.height - this.height)
      this.playPos.yPos = canvas.height - this.height;
    else if (yPos <= 0) this.playPos.yPos = 0;
    else this.playPos.yPos = yPos;
  }
}
