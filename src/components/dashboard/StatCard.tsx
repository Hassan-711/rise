import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  trend?: { value: number; label: string }
  className?: string
  onClick?: () => void
}

export function StatCard({
  title, value, subtitle, icon: Icon, iconColor, iconBg,
  trend, className, onClick
}: StatCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-xl border border-border/50 bg-card p-5 overflow-hidden transition-all duration-200',
        onClick && 'cursor-pointer hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5',
        className
      )}
      onClick={onClick}
    >
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20"
        style={{ background: iconBg || 'hsl(var(--primary))' }} />

      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          {trend && (
            <div className={cn(
              'flex items-center gap-1 text-xs font-medium',
              trend.value >= 0 ? 'text-emerald-400' : 'text-rose-400'
            )}>
              <span>{trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
              <span className="text-muted-foreground font-normal">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={cn(
          'flex h-10 w-10 items-center justify-center rounded-xl',
          iconBg || 'bg-primary/10'
        )}>
          <Icon className={cn('h-5 w-5', iconColor || 'text-primary')} />
        </div>
      </div>
    </div>
  )
}
