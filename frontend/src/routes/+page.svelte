<main>
  <div class="top">
    <h1>Rock Paper Scissors</h1>
    <p>Can't decide or you're just bored? Play against your friend or against a random stranger!</p>
  </div>
  <div class="buttons">
    <a href="room">Play with a Friend</a>
    <a href="random">Play with a Stranger</a>
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
</style>