
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Clock,
  AlertTriangle,
  Users,
  Zap,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

type StatsCardsProps = {
  stats: {
    onTimePerformance: number;
    averageDelay: number;
    totalPassengers: number;
    energyEfficiency: number;
    conflictsResolved: number;
  };
};

export function StatsCards({ stats }: StatsCardsProps) {
  const statCards = [
    {
      title: 'On-Time Performance',
      value: `${stats.onTimePerformance}%`,
      icon: Clock,
      change: 5.2,
      color: 'text-green-500',
    },
    {
      title: 'Average Delay',
      value: `${stats.averageDelay} min`,
      icon: AlertTriangle,
      change: -1.8,
      color: 'text-yellow-500',
    },
    {
      title: 'Total Passengers',
      value: stats.totalPassengers.toLocaleString(),
      icon: Users,
      change: 3.1,
      color: 'text-blue-500',
    },
    {
      title: 'Energy Efficiency',
      value: `${stats.energyEfficiency}%`,
      icon: Zap,
      change: 1.2,
      color: 'text-purple-500',
    },
    {
      title: 'Conflicts Resolved',
      value: stats.conflictsResolved,
      icon: TrendingUp,
      change: 10,
      color: 'text-orange-500',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {statCards.map((card, index) => (
        <Card key={index} className="bg-card/30 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              {card.change > 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              {card.change > 0 ? '+' : ''}
              {card.change}% from last hour
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
