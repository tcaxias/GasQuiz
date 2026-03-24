<script lang="ts">
  import { onMount } from 'svelte';
  import { Game } from '$lib/game/Game';

  let container: HTMLElement;

  onMount(() => {
    const game = new Game();
    game.init(container);

    return () => {
      game.destroy();
    };
  });
</script>

<div bind:this={container} class="w-screen h-screen"></div>
