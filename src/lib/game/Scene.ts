import { Container } from 'pixi.js';
import type { Application } from 'pixi.js';

/**
 * Base class for game scenes.
 * Each scene owns a Container that is added/removed from the stage.
 */
export abstract class Scene {
  protected container: Container;
  protected app: Application;

  constructor(app: Application) {
    this.app = app;
    this.container = new Container();
  }

  /** Called when the scene is first shown. Build your display objects here. */
  abstract setup(): void;

  /** Called every frame. Override for animations. */
  update(_deltaMs: number): void {
    // Default: no-op
  }

  /** Show this scene by adding its container to the stage */
  show(): void {
    this.app.stage.addChild(this.container);
  }

  /** Hide this scene by removing its container from the stage */
  hide(): void {
    this.app.stage.removeChild(this.container);
  }

  /** Clean up resources */
  destroy(): void {
    this.container.destroy({ children: true });
  }

  /** Screen width shortcut */
  protected get width(): number {
    return this.app.screen.width;
  }

  /** Screen height shortcut */
  protected get height(): number {
    return this.app.screen.height;
  }

  /** Center X shortcut */
  protected get centerX(): number {
    return this.width / 2;
  }

  /** Center Y shortcut */
  protected get centerY(): number {
    return this.height / 2;
  }
}
