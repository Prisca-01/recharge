import './StatCard.css';

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  badge?: string;
  badgeVariant?: 'positive' | 'negative' | 'neutral';
}

export function StatCard({ icon, value, label, badge, badgeVariant = 'positive' }: StatCardProps) {
  return (
    <div className="stat-card card">
      <div className="stat-card-header">
        <span className="stat-card-icon">{icon}</span>
        {badge && (
          <span className={`stat-card-badge badge-${badgeVariant}`}>{badge}</span>
        )}
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
}
