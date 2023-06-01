export default interface Drawable {
  ctx: CanvasRenderingContext2D;
  draw: (playerY: number | null) => void;
  move: (...args: any[]) => void;
}
