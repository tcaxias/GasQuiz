import { Application, Text } from 'pixi.js';

export class Game {
  private app: Application;

  constructor() {
    this.app = new Application();
  }

  async init(container: HTMLElement): Promise<void> {
    await this.app.init({
      resizeTo: container,
      background: '#1a1a2e',
      antialias: true,
    });

    container.appendChild(this.app.canvas);

    const title = new Text({
      text: 'GasQuiz',
      style: {
        fontFamily: 'Arial',
        fontSize: 48,
        fill: 0xffffff,
        align: 'center',
      },
    });

    title.anchor.set(0.5);
    title.x = this.app.screen.width / 2;
    title.y = this.app.screen.height / 2;

    this.app.stage.addChild(title);
  }

  destroy(): void {
    this.app.destroy(true);
  }
}
