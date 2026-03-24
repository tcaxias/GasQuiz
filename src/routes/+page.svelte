<script lang="ts">
  import { onMount } from 'svelte';
  import { Game } from '$lib/game/Game';
  import { browser } from '$app/environment';
  import { allTeams } from '$lib/data/teams';
  import { getTeamColors, defaultColors } from '$lib/data/teams';

  const STORAGE_KEY_NAME = 'gasquiz_player_name';
  const STORAGE_KEY_TEAM = 'gasquiz_favorite_team';

  type Screen = 'name' | 'team' | 'game';

  let screen = $state<Screen>('name');
  let playerName = $state('');
  let nameInput = $state('');
  let favoriteTeam = $state('');
  let container: HTMLElement;
  let bgColor = $state('#1a1a2e');

  onMount(() => {
    if (browser) {
      const storedName = localStorage.getItem(STORAGE_KEY_NAME);
      const storedTeam = localStorage.getItem(STORAGE_KEY_TEAM);
      if (storedName && storedTeam) {
        playerName = storedName;
        favoriteTeam = storedTeam;
        updateBgColor(storedTeam);
        startGame();
      } else if (storedName) {
        playerName = storedName;
        screen = 'team';
      }
    }
  });

  function updateBgColor(team: string) {
    const colors = team ? getTeamColors(team) : defaultColors;
    const hex = colors.primary.toString(16).padStart(6, '0');
    bgColor = `#${hex}`;
  }

  function saveName() {
    const trimmed = nameInput.trim();
    if (trimmed.length < 1) return;
    playerName = trimmed;
    localStorage.setItem(STORAGE_KEY_NAME, playerName);
    screen = 'team';
  }

  function handleNameKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') saveName();
  }

  function selectTeam(team: string) {
    favoriteTeam = team;
    localStorage.setItem(STORAGE_KEY_TEAM, team);
    updateBgColor(team);
    startGame();
  }

  function startGame() {
    screen = 'game';

    requestAnimationFrame(() => {
      if (!container) return;
      const game = new Game(playerName, favoriteTeam, (action) => {
        // Game already called destroy() on itself before calling this
        if (action === 'name') {
          nameInput = playerName;
          screen = 'name';
        } else {
          screen = 'team';
        }
      });
      game.init(container);

      const cleanup = () => game.destroy();
      window.addEventListener('beforeunload', cleanup);
    });
  }

  function teamBgStyle(team: string): string {
    const colors = getTeamColors(team);
    const hex = colors.primary.toString(16).padStart(6, '0');
    const textHex = colors.text.toString(16).padStart(6, '0');
    return `background-color: #${hex}; color: #${textHex};`;
  }
</script>

{#if screen === 'name'}
  <div class="fixed inset-0 flex flex-col items-center justify-center px-6" style="background-color: {bgColor}">
    <h1 class="mb-2 text-5xl font-bold text-white sm:text-7xl">GasQuiz</h1>
    <p class="mb-10 text-lg text-[#aaaacc] sm:text-xl">Quiz da Primeira Liga 2025-26</p>

    <div class="flex w-full max-w-sm flex-col gap-4">
      <label for="name" class="text-center text-base text-[#888899]"> Como te chamas? </label>
      <input
        id="name"
        type="text"
        bind:value={nameInput}
        onkeydown={handleNameKeydown}
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
        Continuar
      </button>
    </div>
  </div>
{:else if screen === 'team'}
  <div class="fixed inset-0 flex flex-col items-center overflow-y-auto px-4 py-8" style="background-color: {bgColor}">
    <h1 class="mb-1 text-4xl font-bold text-white sm:text-5xl">GasQuiz</h1>
    <p class="mb-6 text-base text-[#aaaacc]">Olá, {playerName}!</p>

    <h2 class="mb-4 text-center text-lg font-semibold text-white sm:text-xl">
      Qual é o teu clube favorito?
    </h2>

    <div class="grid w-full max-w-md grid-cols-1 gap-2.5 sm:grid-cols-2">
      {#each allTeams as team}
        <button
          onclick={() => selectTeam(team)}
          class="rounded-xl border border-white/20 px-4 py-3.5 text-base font-bold shadow-md transition-all duration-150 hover:scale-[1.04] hover:shadow-xl active:scale-95 sm:text-lg"
          style={teamBgStyle(team)}
        >
          {team}
        </button>
      {/each}
    </div>
  </div>
{:else}
  <div bind:this={container} class="h-screen w-screen"></div>
{/if}
