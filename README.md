# PTTFL Head Coach

Call the play, then play it, in the PTTFL stadium with the league's current rosters.

- **index.html**: play against the CPU.
- **multiplayer.html**: head-to-head against a friend online (Head Coach style).

## Play styles

Pick one on the Game Plan screen (or switch mid-game from the pause menu).

- **Player** (default): every snap is played out live, Madden style. All 22 players move in real time: linemen block and get beaten, receivers run their routes against man or zone coverage that comes from the defensive call, the ball flies through the air and is caught, knocked down or picked by whoever gets to it, and runners go until someone tackles them. You play the QB and whoever has the ball on offense, and any defender you like on defense. Your play call still matters: it sets the coverage, the blocking and the matchups.
- **Head Coach**: call the play and watch it from the sideline.

### Controls

Plays with a keyboard, a touch screen, or an Xbox controller (any controller the browser sees as a standard gamepad works; buttons are named the Xbox way). Plug the controller in and press any button: the on-screen button icons switch to Xbox buttons, and switch back as soon as you touch the keyboard or mouse.

**On the field (Player mode)**

| | Keyboard | Xbox controller |
|---|---|---|
| Snap | Space | A |
| Quick throw | Tap 1–5: a lob to that receiver, out right away | Tap A B X Y RB (shown on each receiver's name plate) |
| Aimed throw | Hold 1–5: a circle shows where the ball will land; WASD moves it to lead him. Hold longer for a harder throw (lob, touch, bullet). Let go to throw | Hold A B X Y RB, aim with the left stick |
| Move the QB | WASD or arrows | Left stick |
| Throw it away | X | LB or right stick click |
| Run | WASD or arrows, Shift to sprint | Left stick, RT to sprint |
| Juke left / right | Q / E (best just before contact) | LB / RB, or flick the right stick |
| Stiff arm, spin, dive or slide | F, Space, Z | A, B, X |
| Defense: switch / dive tackle / hit stick / play the ball / shed | Tab, Space, E, X, F | B, X, LB (or right stick up), Y, A |
| Kicks | Hold Space for power, let go, press again to aim | Same with A |

**Menus and play calling (Xbox controller)**

| | |
|---|---|
| Move the highlight | D-pad or left stick |
| Select / back | A / B |
| Coordinator's call | Y |
| Run plays / pass plays | LB / RB |
| Flip the play | LT |
| OC / DC Auto | RT |
| Timeout | View |
| Pause (and "press start" on menus) | Menu |
| Change camera | X |
| Controls list | Right stick click |
| At the line: pick a receiver / change his route / make him the primary target / reset | LB RB or D-pad left right / D-pad up down / Y / View |

The controller rumbles on hits, fumbles, picks and touchdowns (turn it off in the pause menu). On a phone or tablet you get a stick and buttons on screen; tap a receiver to lob it to him. Throws let go before the receiver comes out of his break land **on time** and are more accurate; a man in tight coverage makes any catch harder. The size of the circle shows how accurate the throw will be: it grows on long throws, under pressure and on the run. If you get hit while winding up, the QB usually still gets a hurried throw off. Press **H** (or click the right stick) in a game for the full list.

## Head-to-head

1. Open `multiplayer.html`, type your name, and pick **Host Here** on any open room (1–8).
2. Send your friend the invite link from the room screen, or have them pick your room in the lobby.
3. Each of you picks a franchise and a game plan. Your friend presses **Ready**, then the host presses **Kick Off**.

Every snap, both coaches call a play at the same time. Neither side sees the other's call until both are locked in, and then the snap plays out the same way on both screens. Whoever wins the coin toss chooses to receive or defer, either side can call a timeout while the clock is running, and halftime adjustments are made by both coaches before the second half.

If someone's connection drops or a page gets reloaded, the game is saved: reopen `multiplayer.html` and press **Resume** (host) or **Rejoin** (guest), and you pick up at the same snap.

**How it connects:** the two browsers connect directly to each other over WebRTC using [PeerJS](https://peerjs.com). PeerJS's free public server only introduces them; nobody needs an account. Some strict networks (certain work, school or mobile networks) block direct connections; if a game won't connect, try a different network.

**Testing on one computer:** add `?net=local` to the address (for example `multiplayer.html?net=local`) and open it in two tabs of the same browser. The tabs talk to each other directly without going online.

## Files

- `assets/hc-game.js`: the game (field, play calling, the Head Coach simulation, and the head-to-head code).
- `assets/hc-live.js`: the Player mode engine (live snaps, controls, throw and kick meters).
- `assets/hc-data.js`: league rosters and ratings.
- `assets/hc.css`: styles.
