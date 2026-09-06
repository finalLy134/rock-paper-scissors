<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let { data } = $props();

  let roomState = $state('started'); // 'started', 'ended', 'waiting'

  onMount(async () => {
    const response = await fetch("http://localhost:8000/room/enter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: data.code }),
    });

    const result = await response.json();

    // If no code was in the URL, the backend generated one. Redirect to it!
    if (!data.code && result.code) {
      goto(`/room/${result.code}`, { replaceState: true });
    }
  });

  let link = $derived(`http://localhost:5173/room/${data.code}`);

  function copyLink() {
    navigator.clipboard.writeText(link)
      .then(() => alert('Copied!'))
      .catch(err => console.error('Error copying text: ', err));
  }
</script>

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
    padding: 5px;
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
    gap: 10px;
  }

  .top {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
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