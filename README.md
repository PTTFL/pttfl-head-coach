# PTTFL Head Coach

Call every play from the sideline of the PTTFL stadium, with the league's current rosters.

- **index.html**: play against the CPU coordinator.
- **multiplayer.html**: head-to-head against a friend online.

## Head-to-head

1. Open `multiplayer.html`, type your name, and pick **Host Here** on any open room (1–8).
2. Send your friend the invite link from the room screen, or have them pick your room in the lobby.
3. Each of you picks a franchise and a game plan. Your friend presses **Ready**, then the host presses **Kick Off**.

Every snap, both coaches call a play at the same time. Neither side sees the other's call until both are locked in, and then the snap plays out the same way on both screens. Whoever wins the coin toss chooses to receive or defer, either side can call a timeout while the clock is running, and halftime adjustments are made by both coaches before the second half.

If someone's connection drops or a page gets reloaded, the game is saved: reopen `multiplayer.html` and press **Resume** (host) or **Rejoin** (guest), and you pick up at the same snap.

**How it connects:** the two browsers connect directly to each other over WebRTC using [PeerJS](https://peerjs.com). PeerJS's free public server only introduces them; nobody needs an account. Some strict networks (certain work, school or mobile networks) block direct connections; if a game won't connect, try a different network.

**Testing on one computer:** add `?net=local` to the address (for example `multiplayer.html?net=local`) and open it in two tabs of the same browser. The tabs talk to each other directly without going online.

## Files

- `assets/hc-game.js`: the game (field, play calling, simulation, and the head-to-head code).
- `assets/hc-data.js`: league rosters and ratings.
- `assets/hc.css`: styles.
