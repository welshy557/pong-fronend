import { Socket } from "socket.io-client";
import Drawable from "./Drawable";
import Player from "./Player";

interface BallPosition {
  xPos: number;
  yPos: number;
  angle: number;
  forward: boolean;
}

export default class Ball implements Drawable {
  player1: Player;
  player2: Player;
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  isHost: boolean;
  socket: Socket;
  ballPos: BallPosition;
  radius: number = 15;
  speed: number = 6;
  constructor(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    player1: Player,
    player2: Player,
    isHost: boolean,
    socket: Socket
  ) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.player1 = player1;
    this.player2 = player2;
    this.isHost = isHost;
    this.socket = socket;

    this.ballPos = {
      xPos: 0,
      yPos: 0,
      angle: 180,
      forward: true,
    };

    this.setRandomAngle();

    if (!isHost) {
      socket.on("moved-ball", (ballPos: BallPosition) => {
        this.ballPos = ballPos;
      });
    }
  }

  draw() {
    if (this.isHost) {
      this.move();
      this.socket.emit("move-ball", this.ballPos);
    }

    this.ctx.beginPath();
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.arc(
      this.ballPos.xPos,
      this.ballPos.yPos,
      this.radius,
      0,
      2 * Math.PI
    );
    this.ctx.fill();
  }

  move() {
    // If moving forward add to xPos, otherwise subtract from x Pos
    if (this.ballPos.forward)
      this.ballPos.xPos += this.speed * Math.cos(this.ballPos.angle);
    else this.ballPos.xPos -= this.speed * Math.cos(this.ballPos.angle);

    this.ballPos.yPos += this.speed * Math.sin(this.ballPos.angle);

    // Side wall collison, negate angle
    if (this.ballPos.yPos <= 0 || this.ballPos.yPos >= this.canvas.height) {
      this.ballPos.angle = this.ballPos.angle * -1;
    }

    // Out of bounds, reset ball
    if (this.ballPos.xPos <= 0 || this.ballPos.xPos >= this.canvas.width) {
      this.setRandomAngle();
    }

    // Horizontal, change direction

    if (
      (this.ballPos.xPos < this.player1.playPos.xPos + this.player1.width &&
        this.ballPos.xPos + this.radius > this.player1.playPos.xPos &&
        this.ballPos.yPos + this.player1.playPos.yPos + this.player1.height &&
        this.ballPos.yPos + this.radius > this.player1.playPos.yPos) ||
      (this.ballPos.xPos < this.player2.playPos.xPos + this.player2.width &&
        this.ballPos.xPos + this.radius > this.player2.playPos.xPos &&
        this.ballPos.yPos + this.player2.playPos.yPos + this.player2.height &&
        this.ballPos.yPos + this.radius > this.player2.playPos.yPos)
    ) {
      this.ballPos.forward = !this.ballPos.forward;
    }
  }

  setRandomAngle() {
    this.ballPos.xPos = this.canvas.width / 2;
    this.ballPos.yPos = this.canvas.height / 2;
    this.ballPos.forward = Math.round(Math.random()) === 0 ? true : false;

    // Ensure random angle is not between 30 and 60 to avoid straight vertical movement
    const rnd1 = Math.floor(Math.random() * 30 + 1);
    const rnd2 = Math.floor(Math.random() * 90 + 60);
    this.ballPos.angle = Math.round(Math.random()) === 0 ? rnd1 : rnd2;
  }
}
