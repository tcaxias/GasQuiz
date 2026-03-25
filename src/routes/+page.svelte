<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { allTeams, getTeamColors, defaultColors } from '$lib/data/teams';
  import { SEASON } from '$lib/config';

  const STORAGE_KEY_NAME = 'gasquiz_player_name';
  const STORAGE_KEY_TEAM = 'gasquiz_favorite_team';

  /** Allowed characters for player name: letters, numbers, spaces, hyphens, apostrophes */
  const NAME_PATTERN = /[^\p{L}\p{N}\s\-']/gu;
  const MAX_NAME_LENGTH = 20;

  type Screen = 'name' | 'team' | 'game';

  let screen = $state<Screen>('name');
  let playerName = $state('');
  let nameInput = $state('');
  let favoriteTeam = $state('');
  let container = $state<HTMLElement>();
  let bgColor = $state('#1a1a2e');
  let ariaLiveText = $state('');
  let currentCleanup: (() => void) | null = null;
  let gameInitError = $state(false);

  onMount(() => {
    const storedName = storageGet(STORAGE_KEY_NAME);
    const storedTeam = storageGet(STORAGE_KEY_TEAM);

    // Validate stored values — sanitize and guard against tampering
    const sanitizedStored = storedName ? sanitizeName(storedName) : null;
    const validName = sanitizedStored && sanitizedStored.length >= 1 ? sanitizedStored : null;
    const validTeam = storedTeam && allTeams.includes(storedTeam) ? storedTeam : null;

    if (!validName && storedName) {
      storageRemove(STORAGE_KEY_NAME);
    }
    if (!validTeam && storedTeam) {
      storageRemove(STORAGE_KEY_TEAM);
    }

    if (validName && validTeam) {
      playerName = validName;
      favoriteTeam = validTeam;
      updateBgColor(validTeam);
      startGame();
    } else if (validName) {
      playerName = validName;
      nameInput = validName;
      screen = 'team';
    }
  });

  onDestroy(() => {
    if (currentCleanup) {
      currentCleanup();
      currentCleanup = null;
    }
  });

  function updateBgColor(team: string) {
    const colors = team ? getTeamColors(team) : defaultColors;
    const hex = colors.primary.toString(16).padStart(6, '0');
    bgColor = `#${hex}`;
  }

  function sanitizeName(raw: string): string {
    return raw.replace(NAME_PATTERN, '').trim().slice(0, MAX_NAME_LENGTH);
  }

  /** Safe localStorage getter — returns null on error (e.g. private browsing) */
  function storageGet(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  /** Safe localStorage setter — silently fails on error */
  function storageSet(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Storage unavailable — game works fine without persistence
    }
  }

  /** Safe localStorage remover */
  function storageRemove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // Storage unavailable
    }
  }

  function saveName() {
    const sanitized = sanitizeName(nameInput);
    if (sanitized.length < 1) return;
    playerName = sanitized;
    nameInput = sanitized;
    storageSet(STORAGE_KEY_NAME, playerName);
    screen = 'team';
  }

  function handleNameKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') saveName();
  }

  function selectTeam(team: string) {
    favoriteTeam = team;
    storageSet(STORAGE_KEY_TEAM, team);
    updateBgColor(team);
    startGame();
  }

  async function startGame() {
    screen = 'game';
    gameInitError = false;

    // Wait for Svelte to flush DOM updates so container is mounted
    await tick();
    if (!container) return;

    // Remove previous cleanup listener if any
    if (currentCleanup) {
      window.removeEventListener('beforeunload', currentCleanup);
      currentCleanup = null;
    }

    try {
      // Lazy-load the game engine (and all its data dependencies) only when needed
      const { Game } = await import('$lib/game/Game');

      const game = new Game(
        playerName,
        favoriteTeam,
        (action) => {
          // Game already called destroy() on itself
          if (currentCleanup) {
            window.removeEventListener('beforeunload', currentCleanup);
            currentCleanup = null;
          }
          if (action === 'name') {
            nameInput = playerName;
            screen = 'name';
          } else {
            screen = 'team';
          }
        },
        (text) => {
          ariaLiveText = text;
        },
      );

      // Init audio inside this gesture-adjacent context (selectTeam click → tick)
      game.initAudio();
      await game.init(container);

      currentCleanup = () => game.destroy();
      window.addEventListener('beforeunload', currentCleanup);
    } catch (err) {
      console.error('Game failed to initialize:', err);
      gameInitError = true;
    }
  }

  function teamBgStyle(team: string): string {
    const colors = getTeamColors(team);
    const hex = colors.primary.toString(16).padStart(6, '0');
    const textHex = colors.text.toString(16).padStart(6, '0');
    return `background-color: #${hex}; color: #${textHex};`;
  }
</script>

{#if screen === 'name'}
  <div
    class="fixed inset-0 flex flex-col items-center justify-center px-6"
    style="background-color: {bgColor}"
  >
    <h1 class="mb-2 text-5xl font-bold text-white sm:text-7xl">GasQuiz</h1>
    <p class="mb-10 text-lg text-[#aaaacc] sm:text-xl">Quiz da Primeira Liga {SEASON}</p>

    <div class="flex w-full max-w-sm flex-col gap-4">
      <label for="name" class="text-center text-base text-[#888899]"> Como te chamas? </label>
      <input
        id="name"
        type="text"
        bind:value={nameInput}
        onkeydown={handleNameKeydown}
        placeholder="O teu nome"
        maxlength={MAX_NAME_LENGTH}
        autocomplete="off"
        class="w-full rounded-xl border-2 border-[#34495e] bg-[#16213e] px-5 py-4 text-center text-xl text-white placeholder-[#555] outline-none transition-colors focus:border-[#3498db]"
      />
      <button
        onclick={saveName}
        disabled={sanitizeName(nameInput).length < 1}
        class="w-full rounded-xl bg-[#2ecc71] px-5 py-4 text-xl font-bold text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-30"
      >
        Continuar
      </button>
    </div>
  </div>
{:else if screen === 'team'}
  <div
    class="fixed inset-0 flex flex-col items-center overflow-y-auto px-4 py-8"
    style="background-color: {bgColor}"
    role="region"
    aria-label="Selecao de clube"
  >
    <h1 class="mb-1 text-4xl font-bold text-white sm:text-5xl">GasQuiz</h1>
    <p class="mb-6 text-base text-[#aaaacc]">Ola, {playerName}!</p>

    <h2 class="mb-4 text-center text-lg font-semibold text-white sm:text-xl">
      Qual é o teu clube favorito?
    </h2>

    <div class="grid w-full max-w-md grid-cols-1 gap-2.5 sm:grid-cols-2">
      {#each allTeams as team (team)}
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
  <div bind:this={container} class="game-container h-screen w-screen">
    {#if gameInitError}
      <div
        class="flex h-full w-full flex-col items-center justify-center gap-4 px-6 text-center"
        style="background-color: {bgColor}"
      >
        <p class="text-2xl font-bold text-white">O jogo nao pode ser carregado</p>
        <p class="text-lg text-[#aaaacc]">O teu browser pode nao suportar WebGL.</p>
        <button
          onclick={() => {
            screen = 'name';
            gameInitError = false;
          }}
          class="mt-4 rounded-xl bg-[#3498db] px-6 py-3 text-lg font-bold text-white hover:opacity-90"
        >
          Voltar
        </button>
      </div>
    {/if}
  </div>

  <!-- ARIA live region for screen reader announcements -->
  <div aria-live="polite" aria-atomic="true" class="sr-only">
    {ariaLiveText}
  </div>
{/if}
