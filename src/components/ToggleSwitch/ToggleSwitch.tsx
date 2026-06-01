import './ToggleSwitch.css';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  id: string;
}

export function ToggleSwitch({ checked, onChange, label, description, icon, id }: ToggleSwitchProps) {
  return (
    <div className="toggle-row">
      {icon && <span className="toggle-icon">{icon}</span>}
      <div className="toggle-text">
        <label className="toggle-label" htmlFor={id}>{label}</label>
        {description && <p className="toggle-description">{description}</p>}
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`toggle-switch ${checked ? 'checked' : ''}`}
      >
        <span className="toggle-thumb" />
      </button>
    </div>
  );
}
