<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';

  let { data } = $props();

  const API_BASE = 'http://localhost:8000';

  // Per-tab player identity, persisted in sessionStorage so a refresh in
  // this same tab keeps you as the same player, but a second tab (even in
  // the same browser) gets its own id.
  function getPlayerId(): string {
    if (!browser) return '';
    let id = sessionStorage.getItem('rps-player-id');
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem('rps-player-id', id);
    }
    return id;
  }

  const playerId = getPlayerId();

  function apiFetch(path: string, init: RequestInit = {}) {
    return fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        ...(init.headers || {}),
        'X-Player-Id': playerId
      }
    });
  }

  let roomStatus = $state("waiting");
  let activeCode = $derived(data.code);
  let generatedCode: string | null = $state(null);
  let finalActiveCode = $derived(generatedCode || activeCode);

  let interval: any;

  let playerChoice: string | null = $state(null);
  let matchResult: any = $state(null);

  function startPolling() {
    clearInterval(interval);
    interval = setInterval(async () => {
      const res = await apiFetch(`/room/${finalActiveCode}/status`);
      if (!res.ok) return;
      const resData = await res.json();
      if (resData.status === "started" || resData.status === "finished") {
        roomStatus = "started";
        if (resData.status === "finished") {
          matchResult = resData;
          clearInterval(interval);
        }
      }
    }, 2000);
  }

  onMount(async () => {
    const response = await apiFetch(`/room/enter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: data.code }),
    });
    const result = await response.json();

    if (!data.code && result.code) {
      generatedCode = result.code;
      goto(`/room/${result.code}`, { replaceState: true });
    }

    startPolling();
  });

  onDestroy(() => {
    clearInterval(interval);
  });

  let link = $derived(browser ? `${window.location.origin}/room/${finalActiveCode}` : '');

  function copyLink() {
    navigator.clipboard.writeText(link)
      .then(() => alert('Copied!'))
      .catch(err => console.error('Error copying text: ', err));
  }

  async function makeChoice(choice: string) {
    playerChoice = choice.toLowerCase();
    const res = await apiFetch(`/room/${finalActiveCode}/makeChoice`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerChoice })
    });
    const resData = await res.json();
    if (resData.status === "finished") {
      matchResult = resData;
      clearInterval(interval);
    }
  }

  async function playAgain() {
    await apiFetch(`/room/${finalActiveCode}/rematch`, { method: 'POST' });
    playerChoice = null;
    matchResult = null;
    startPolling();
  }

  let outcomeText = $derived.by(() => {
    if (!matchResult) return '';
    if (matchResult.winner === 'tie') return "It's a tie!";
    return matchResult.winner === matchResult.currentUserId ? "You win! 🎉" : "You lose.";
  });
</script>

{#if roomStatus == "waiting"}
<main>
  <div class="top">
    <h1>Private Room</h1>
    <p>Waiting for another player to join...</p>
    <div class="link-container">
      <button class="copy-link-btn" onclick={copyLink}>Copy Link</button>
      <p class="link">{link}</p>
    </div>
  </div>
  <div class="buttons">
    <a href="/">Back</a>
  </div>
</main>
{:else}
<main>
  <div class="top">
    <h1>Rock Paper Scissors</h1>
    <p>Match started! Make your move:</p>

    {#if !playerChoice}
      <div class="choice-buttons">
        <button class="choice-btn" onclick={() => makeChoice('Rock')}>✊ Rock</button>
        <button class="choice-btn" onclick={() => makeChoice('Paper')}>✋ Paper</button>
        <button class="choice-btn" onclick={() => makeChoice('Scissors')}>✌️ Scissors</button>
      </div>
    {:else if !matchResult}
      <p class="selected-text">You chose: <strong>{playerChoice}</strong></p>
      <p>Waiting for opponent...</p>
    {:else}
      <p class="selected-text">You chose: <strong>{playerChoice}</strong></p>
      <div class="result-box">
        <h2>{outcomeText}</h2>
        <button class="copy-link-btn" onclick={playAgain}>Play Again</button>
      </div>
    {/if}
  </div>
  <div class="buttons">
    <a href="/">Leave Room</a>
  </div>
</main>
{/if}

<style>
  @import url('https://fonts.googleapis.com/css2?family=Cascadia+Code:ital,wght@0,200..700;1,200..700&family=Geist:ital,wght@0,100..900;1,100..900&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Sansation:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap');

  :global(*) {
    font-family: 'Inter', sans-serif;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    height: 100vh;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  h1, p {
    text-align: center;
  }

  h1 {
    margin-bottom: 5px;
  }

  .buttons {
    display: flex;
    flex-direction: column;
    gap: 7.5px;
  }

  a {
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    background-color: aquamarine;
    border: none;
    border-radius: 10px;
    padding: 8px;
    transition: background-color 0.2s ease;
    text-align: center;
    text-decoration: none;
    color: black;
  }

  a:hover {
    background-color: rgb(155, 250, 218);
  }

  a:active {
    background-color: rgb(134, 231, 198);
  }

  main {
    display: flex;
    flex-direction: column;
    width: 400px;
    gap: 15px;
  }

  .top {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .choice-buttons {
    display: flex;
    gap: 10px;
    margin-top: 10px;
  }

  .choice-btn {
    cursor: pointer;
    font-weight: bold;
    font-size: 15px;
    background-color: aquamarine;
    border: none;
    border-radius: 8px;
    padding: 10px 15px;
    transition: background-color 0.2s ease;
  }

  .choice-btn:hover {
    background-color: rgb(155, 250, 218);
  }

  .selected-text {
    font-size: 18px;
    margin-top: 10px;
  }

  .result-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
  }

  .link-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    height: fit-content;
    width: fit-content;
  }

  .copy-link-btn {
    cursor: pointer;
    font-weight: bold;
    background-color: aquamarine;
    border: none;
    border-radius: 5px;
    padding: 5px 10px;
    transition: background-color 0.2s ease;
    text-align: center;
    text-decoration: none;
    color: black;
  }

  .copy-link-btn:hover {
    background-color: rgb(155, 250, 218);
  }

  .copy-link-btn:active {
    background-color: rgb(134, 231, 198);
  }

  .link {
    background-color: gainsboro;
    border-radius: 5px;
    padding: 5px 10px;
    margin: 5px;
  }
</style>