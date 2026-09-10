export function launchConfetti() {
  const colors = ['#00f5d4', '#f637ec', '#ffb703', '#ff4d6d', '#d7e0ea'];
  for (let i = 0; i < 90; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = Math.random() * 100 + 'vw';
    c.style.background = colors[Math.floor(Math.random() * colors.length)];
    c.style.animationDuration = (2 + Math.random() * 2) + 's';
    c.style.animationDelay = (Math.random() * 0.6) + 's';
    c.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 4200);
  }
}

export function removeOverlay() {
  const o = document.getElementById('winOverlay');
  if (o) o.remove();
  document.querySelectorAll('.confetti').forEach(c => c.remove());
}