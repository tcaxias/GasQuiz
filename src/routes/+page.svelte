<script lang="ts">
  import { onMount } from 'svelte';
  import { Game } from '$lib/game/Game';
  import { browser } from '$app/environment';

  const STORAGE_KEY = 'gasquiz_player_name';

  let playerName = $state('');
  let nameInput = $state('');
  let gameStarted = $state(false);
  let container: HTMLElement;

  onMount(() => {
    if (browser) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        playerName = stored;
        startGame();
      }
    }
  });

  function saveName() {
    const trimmed = nameInput.trim();
    if (trimmed.length < 1) return;
    playerName = trimmed;
    localStorage.setItem(STORAGE_KEY, playerName);
    startGame();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') saveName();
  }

  function startGame() {
    gameStarted = true;

    // Wait for the container div to be in the DOM
    requestAnimationFrame(() => {
      if (!container) return;
      const game = new Game(playerName);
      game.init(container);

      // Store cleanup for onDestroy
      const cleanup = () => game.destroy();
      window.addEventListener('beforeunload', cleanup);
    });
  }
</script>

{#if !gameStarted}
  <div class="fixed inset-0 flex flex-col items-center justify-center bg-[#1a1a2e] px-6">
    <h1 class="mb-2 text-5xl font-bold text-white sm:text-7xl">GasQuiz</h1>
    <p class="mb-10 text-lg text-[#aaaacc] sm:text-xl">Quiz da Primeira Liga 2025-26</p>

    <div class="flex w-full max-w-sm flex-col gap-4">
      <label for="name" class="text-center text-base text-[#888899]"> Como te chamas? </label>
      <input
        id="name"
        type="text"
        bind:value={nameInput}
        onkeydown={handleKeydown}
        placeholder="O teu nome"
        maxlength="20"
        autocomplete="off"
        class="w-full rounded-xl border-2 border-[#34495e] bg-[#16213e] px-5 py-4 text-center text-xl text-white placeholder-[#555] outline-none transition-colors focus:border-[#3498db]"
      />
      <button
        onclick={saveName}
        disabled={nameInput.trim().length < 1}
        class="w-full rounded-xl bg-[#2ecc71] px-5 py-4 text-xl font-bold text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-30"
      >
        Começar
      </button>
    </div>
  </div>
{:else}
  <div bind:this={container} class="h-screen w-screen"></div>
{/if}
