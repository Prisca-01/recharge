// Generates tones using Web Audio API — no external files needed

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function playTone(frequency: number, duration: number, volume = 0.3, type: OscillatorType = 'sine'): void {
  const ac = getCtx();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0, ac.currentTime);
  gain.gain.linearRampToValueAtTime(volume, ac.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
  osc.start(ac.currentTime);
  osc.stop(ac.currentTime + duration);
}

export function playSessionComplete(): void {
  // Three ascending chimes
  playTone(523, 0.3, 0.25); // C5
  setTimeout(() => playTone(659, 0.3, 0.25), 200); // E5
  setTimeout(() => playTone(784, 0.5, 0.25), 400); // G5
}

export function playBreakComplete(): void {
  // Two gentle descending tones
  playTone(659, 0.3, 0.2); // E5
  setTimeout(() => playTone(523, 0.5, 0.2), 200); // C5
}

export function playTick(): void {
  playTone(880, 0.05, 0.05, 'square');
}

export function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return Promise.resolve('denied');
  return Notification.requestPermission();
}

export function sendNotification(title: string, body: string): void {
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.svg' });
  }
}
