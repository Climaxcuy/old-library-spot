// reading-hud.js — the heads-up display: everything the reader reads
// off the page rather than the room.
//
// The remaining count is the loudest thing on the page after the panels
// themselves; the found count rides beside it; the timer is a draining
// bar that reddens under twenty seconds so the pressure is felt in the
// frame even mid-search. Found changes collect as chips under the
// panels, each naming what was spotted.

export function createReadingHud(doc) {
  const els = {
    roundName: doc.getElementById('hud-round'),
    left: doc.getElementById('hud-left'),
    found: doc.getElementById('hud-found'),
    time: doc.getElementById('hud-time'),
    timeBar: doc.getElementById('hud-timebar'),
    score: doc.getElementById('hud-score'),
    hints: doc.getElementById('hud-hints'),
    message: doc.getElementById('message'),
    foundList: doc.getElementById('found-list'),
    status: doc.getElementById('status'),
  };
  let messageTimer = 0;

  function announce(text) {
    els.status.textContent = text;
  }

  return {
    els,
    setRound(name, index, total) {
      els.roundName.textContent = `Round ${index + 1} of ${total} — ${name}`;
    },
    setCounts(foundCount, total) {
      const left = total - foundCount;
      els.left.textContent = String(left);
      els.found.textContent = `${foundCount} found`;
      announce(`${left} differences still to find.`);
    },
    setTime(secondsLeft, secondsTotal) {
      const s = Math.max(0, Math.ceil(secondsLeft));
      els.time.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
      const frac = Math.max(0, secondsLeft / secondsTotal);
      els.timeBar.style.width = `${frac * 100}%`;
      els.timeBar.classList.toggle('low', secondsLeft < 20);
      els.time.classList.toggle('low', secondsLeft < 20);
    },
    setScore(score) {
      els.score.textContent = String(score);
    },
    setHints(hintsLeft) {
      els.hints.textContent = `${hintsLeft} hint${hintsLeft === 1 ? '' : 's'}`;
    },
    toast(text, ms = 2600) {
      els.message.textContent = text;
      els.message.classList.add('show');
      announce(text);
      clearTimeout(messageTimer);
      messageTimer = setTimeout(() => els.message.classList.remove('show'), ms);
    },
    addFound(label) {
      const chip = doc.createElement('li');
      chip.textContent = `✓ ${label}`;
      els.foundList.appendChild(chip);
    },
    resetFoundList() {
      els.foundList.textContent = '';
    },
  };
}
