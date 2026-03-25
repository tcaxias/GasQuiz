import { Container, Text, Graphics } from 'pixi.js';
import type { Application } from 'pixi.js';

/** Reference design dimensions (mid-size desktop) */
const REF_WIDTH = 800;
const REF_HEIGHT = 600;

/** Whether the user prefers reduced motion */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** Whether the device is likely a mobile/touch device */
export function isMobileDevice(): boolean {
  return typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0;
}

/**
 * Compute perceived luminance of a hex color (0x000000–0xffffff).
 * Returns 0–1 where 0 is black and 1 is white.
 */
export function colorLuminance(color: number): number {
  const r = (color >> 16) & 0xff;
  const g = (color >> 8) & 0xff;
  const b = color & 0xff;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

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

  /**
   * Called when the viewport is resized (e.g. device rotation).
   * Default implementation rebuilds the scene from scratch.
   * Subclasses can override for more efficient re-layout.
   */
  resize(): void {
    this.container.removeChildren();
    this.setup();
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

  // ── Shared UI components ────────────────────────────

  /**
   * Create a styled, interactive button.
   * Shared across all scenes to avoid duplication.
   */
  protected createButton(
    label: string,
    x: number,
    y: number,
    color: number,
    onClick: () => void,
  ): Container {
    const btnContainer = new Container();
    btnContainer.x = x;
    btnContainer.y = y;

    const w = this.buttonWidth;
    const h = this.buttonHeight;

    const bg = new Graphics();
    bg.roundRect(-w / 2, -h / 2, w, h, this.s(12));
    bg.fill(color);
    btnContainer.addChild(bg);

    const btnTextColor = colorLuminance(color) > 0.5 ? 0x1a1a2e : 0xffffff;

    const text = new Text({
      text: label,
      style: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: this.s(24),
        fontWeight: 'bold',
        fill: btnTextColor,
      },
    });
    text.anchor.set(0.5);
    btnContainer.addChild(text);

    btnContainer.eventMode = 'static';
    btnContainer.cursor = 'pointer';

    btnContainer.on('pointerover', () => {
      btnContainer.scale.set(1.05);
      bg.tint = 0xdddddd;
    });
    btnContainer.on('pointerout', () => {
      btnContainer.scale.set(1.0);
      bg.tint = 0xffffff;
    });
    btnContainer.on('pointerdown', () => {
      onClick();
    });

    return btnContainer;
  }
}
