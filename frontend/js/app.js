const API_BASE = "http://localhost:3000";

async function createRoom() {
  try {
    const response = await fetch('http://localhost:3000/room', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
}
