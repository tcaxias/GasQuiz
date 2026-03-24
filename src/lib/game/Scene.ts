import { Container } from 'pixi.js';
import type { Application } from 'pixi.js';

/** Reference design dimensions (mid-size desktop) */
const REF_WIDTH = 800;
const REF_HEIGHT = 600;

/**
 * Base class for game scenes.
 * Provides responsive scaling helpers so scenes look good on any screen size.
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

  // ── Responsive helpers ──────────────────────────────

  /** Screen width */
  protected get width(): number {
    return this.app.screen.width;
  }

  /** Screen height */
  protected get height(): number {
    return this.app.screen.height;
  }

  /** Center X */
  protected get centerX(): number {
    return this.width / 2;
  }

  /** Center Y */
  protected get centerY(): number {
    return this.height / 2;
  }

  /**
   * Scale factor based on screen size vs reference dimensions.
   * Returns ~0.5 on small phones, ~1.0 on tablets, up to 1.5 on large desktops.
   */
  protected get scale(): number {
    return Math.min(this.width / REF_WIDTH, this.height / REF_HEIGHT, 1.5);
  }

  /**
   * Scale a pixel value proportionally to the screen.
   * Use this for all font sizes, paddings, button sizes.
   * Example: `this.s(48)` → 48px at reference size, ~24px on phone.
   */
  protected s(px: number): number {
    return Math.round(px * this.scale);
  }

  /** Button width — fills most of the screen on mobile, capped on desktop */
  protected get buttonWidth(): number {
    return Math.min(this.s(400), this.width * 0.85);
  }

  /** Standard button height, responsive */
  protected get buttonHeight(): number {
    return this.s(56);
  }

  /** Padding from screen edges */
  protected get padding(): number {
    return this.s(20);
  }
}
