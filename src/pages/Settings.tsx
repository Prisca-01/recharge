import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ToggleSwitch } from '../components/ToggleSwitch/ToggleSwitch';
import { requestNotificationPermission } from '../utils/sound';
import './Settings.css';

const FOCUS_OPTIONS = [25, 45, 60];
const SHORT_BREAK_OPTIONS = [5, 10, 15];
const LONG_BREAK_OPTIONS = [20, 30, 45];
const SESSION_OPTIONS = [2, 3, 4, 5];

const SoundIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
  </svg>
);
const BellIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const CoffeeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
    <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
  </svg>
);
const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
const MusicIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
  </svg>
);

export default function Settings() {
  const { settings, updateSettings } = useApp();
  const [saved, setSaved] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);

  const patch = (updates: Partial<typeof settings>) =>
    setLocalSettings(s => ({ ...s, ...updates }));

  const handleSave = () => {
    updateSettings(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleNotificationsToggle = async (checked: boolean) => {
    if (checked) {
      const perm = await requestNotificationPermission();
      patch({ notificationsEnabled: perm === 'granted' });
    } else {
      patch({ notificationsEnabled: false });
    }
  };

  return (
    <div className="settings-page fade-in">
      <div className="page-glow" />
      <div className="settings-inner">
        <div className="settings-header">
          <h1 className="settings-title">Settings</h1>
          <p className="settings-subtitle">Customize Recharge to fit your workflow</p>
        </div>

        {/* Alerts & Notifications */}
        <section className="settings-section card">
          <div className="settings-section-header">
            <h2 className="settings-section-title">Alerts &amp; Notifications</h2>
            <p className="settings-section-desc">Control how Recharge communicates with you</p>
          </div>
          <div className="settings-section-body">
            <ToggleSwitch
              id="sound-alerts"
              checked={localSettings.soundEnabled}
              onChange={v => patch({ soundEnabled: v })}
              label="Sound Alerts"
              description="Play a chime when a session ends"
              icon={<SoundIcon />}
            />
            <div className="divider" />
            <ToggleSwitch
              id="desktop-notifs"
              checked={localSettings.notificationsEnabled}
              onChange={handleNotificationsToggle}
              label="Desktop Notifications"
              description="Send a system notification on timer end"
              icon={<BellIcon />}
            />
            <div className="divider" />
            <ToggleSwitch
              id="break-reminders"
              checked={localSettings.breakReminders}
              onChange={v => patch({ breakReminders: v })}
              label="Break Reminders"
              description="Remind you to take breaks after long sessions"
              icon={<CoffeeIcon />}
            />
          </div>
        </section>

        {/* Appearance */}
        <section className="settings-section card">
          <div className="settings-section-header">
            <h2 className="settings-section-title">Appearance</h2>
            <p className="settings-section-desc">Adjust the look and feel of the app</p>
          </div>
          <div className="settings-section-body">
            <ToggleSwitch
              id="dark-mode"
              checked={localSettings.darkMode}
              onChange={v => patch({ darkMode: v })}
              label="Dark Mode"
              description="Use the dark color scheme (recommended)"
              icon={<MoonIcon />}
            />
            <div className="divider" />
            <ToggleSwitch
              id="ambient-sounds"
              checked={localSettings.ambientSounds}
              onChange={v => patch({ ambientSounds: v })}
              label="Ambient Sounds"
              description="Play background sounds during focus sessions"
              icon={<MusicIcon />}
            />
          </div>
        </section>

        {/* Timer Defaults */}
        <section className="settings-section card">
          <div className="settings-section-header">
            <h2 className="settings-section-title">Timer Defaults</h2>
            <p className="settings-section-desc">Set your preferred session and break lengths</p>
          </div>
          <div className="settings-section-body">
            <div className="timer-defaults">
              <div className="timer-default-group">
                <label className="timer-default-label">FOCUS DURATION</label>
                <div className="timer-pills">
                  {FOCUS_OPTIONS.map(m => (
                    <button
                      key={m}
                      className={`timer-pill ${localSettings.focusDuration === m ? 'active' : ''}`}
                      onClick={() => patch({ focusDuration: m })}
                    >{m}m</button>
                  ))}
                  <input
                    type="number"
                    className="timer-pill timer-pill-input"
                    placeholder="Custom"
                    min={1} max={180}
                    value={FOCUS_OPTIONS.includes(localSettings.focusDuration) ? '' : localSettings.focusDuration}
                    onChange={e => {
                      const v = parseInt(e.target.value);
                      if (v > 0) patch({ focusDuration: v });
                    }}
                  />
                </div>
              </div>

              <div className="timer-default-group">
                <label className="timer-default-label">SHORT BREAK</label>
                <div className="timer-pills">
                  {SHORT_BREAK_OPTIONS.map(m => (
                    <button
                      key={m}
                      className={`timer-pill ${localSettings.shortBreak === m ? 'active' : ''}`}
                      onClick={() => patch({ shortBreak: m })}
                    >{m}m</button>
                  ))}
                </div>
              </div>

              <div className="timer-default-group">
                <label className="timer-default-label">LONG BREAK</label>
                <div className="timer-pills">
                  {LONG_BREAK_OPTIONS.map(m => (
                    <button
                      key={m}
                      className={`timer-pill ${localSettings.longBreak === m ? 'active' : ''}`}
                      onClick={() => patch({ longBreak: m })}
                    >{m}m</button>
                  ))}
                </div>
              </div>

              <div className="timer-default-group">
                <label className="timer-default-label">LONG BREAK AFTER</label>
                <div className="timer-pills">
                  {SESSION_OPTIONS.map(n => (
                    <button
                      key={n}
                      className={`timer-pill ${localSettings.sessionsBeforeLongBreak === n ? 'active' : ''}`}
                      onClick={() => patch({ sessionsBeforeLongBreak: n })}
                    >{n} sessions</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="settings-footer">
          <button className={`save-btn ${saved ? 'saved' : ''}`} onClick={handleSave}>
            {saved ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                Saved!
              </>
            ) : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
