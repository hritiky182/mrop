import React, { useState, useEffect } from 'react';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { equipmentRepository } from '@/services/repositories/equipmentRepository';
import { Equipment } from '@/types';
import { formatNumber, formatPercent } from '@/utils/formatters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Clock, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

export const UptimeDowntimePage: React.FC = () => {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    equipmentRepository.getAll().then((data) => {
      setEquipmentList(data);
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  // Downtime by equipment
  const downtimeByEquipment = equipmentList.map((eq) => ({
    name: eq.id,
    plannedHours: Math.round(eq.downtimeHoursTotal * 0.65),
    unplannedHours: Math.round(eq.downtimeHoursTotal * 0.35),
    totalHours: eq.downtimeHoursTotal,
  }));

  // Weekly availability trend
  const weeklyAvailability = [
    { week: 'W38 (Sep 14)', availability: 93.4, target: 90.0 },
    { week: 'W39 (Sep 21)', availability: 91.2, target: 90.0 },
    { week: 'W40 (Sep 28)', availability: 89.8, target: 90.0 },
    { week: 'W41 (Oct 05)', availability: 92.5, target: 90.0 },
    { week: 'W42 (Oct 12)', availability: 88.6, target: 90.0 }, // Dip due to HT-204
    { week: 'W43 (Current)', availability: 89.2, target: 90.0 },
  ];

  // Downtime causes
  const downtimeCauses = [
    { cause: 'Scheduled Relining & Overhauls', hours: 1040, fill: '#14283F' },
    { cause: 'Hydraulic Leaks & Valve Faults', hours: 680, fill: '#C74646' },
    { cause: 'Electrical & Sensor Trips', hours: 420, fill: '#D99A22' },
    { cause: 'Conveyor Splice & Belt Wear', hours: 380, fill: '#C47B45' },
    { cause: 'Routine 250h/500h Servicing', hours: 315, fill: '#16805D' },
  ];

  const totalDowntime = downtimeByEquipment.reduce((sum, d) => sum + d.totalHours, 0);
  const totalPlanned = downtimeByEquipment.reduce((sum, d) => sum + d.plannedHours, 0);
  const totalUnplanned = downtimeByEquipment.reduce((sum, d) => sum + d.unplannedHours, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Plant & Fleet Uptime Analytics</h2>
        <p className="text-xs text-slate-500 mt-1">
          Root cause analysis, planned versus unplanned downtime, and asset availability trends.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KpiCard
          title="Total Downtime Recorded"
          value={`${formatNumber(totalDowntime)} hrs`}
          comparison="YTD across 8 primary assets"
          accent="navy"
          iconName="Clock"
        />

        <KpiCard
          title="Planned Maintenance"
          value={`${formatNumber(totalPlanned)} hrs`}
          comparison={`${formatPercent((totalPlanned / totalDowntime) * 100, 1)} of total downtime`}
          accent="emerald"
          iconName="Activity"
        />

        <KpiCard
          title="Unplanned Equipment Trips"
          value={`${formatNumber(totalUnplanned)} hrs`}
          comparison={`${formatPercent((totalUnplanned / totalDowntime) * 100, 1)} of total downtime`}
          accent="rose"
          iconName="AlertTriangle"
        />

        <KpiCard
          title="Average Fleet Uptime"
          value="89.2%"
          comparison="Baseline SLA: 90.0%"
          accent="copper"
          iconName="ShieldCheck"
        />
      </div>

      {/* Weekly availability trend line chart */}
      <ChartCard
        title="Weekly Plant & Mobile Fleet Availability Trend (%)"
        subtitle="Tracking against the 90.0% operational availability contract benchmark"
      >
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyAvailability} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis domain={[80, 100]} tick={{ fontSize: 11, fill: '#64748B' }} unit="%" />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                formatter={(val: any) => [`${Number(val).toFixed(1)}%`, '']}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line
                type="monotone"
                dataKey="availability"
                name="Fleet Availability (%)"
                stroke="#16805D"
                strokeWidth={3}
                dot={{ r: 4, fill: '#16805D' }}
              />
              <Line
                type="monotone"
                dataKey="target"
                name="Target Benchmark (90.0%)"
                stroke="#C74646"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Downtime by equipment & Root causes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            title="Downtime by Equipment (Planned vs Unplanned Hours)"
            subtitle="Comparing scheduled service windows against breakdown interruptions"
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={downtimeByEquipment} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} unit=" h" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                    formatter={(val: any) => [`${val} hours`, '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="plannedHours" name="Planned (Hours)" fill="#14283F" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="unplannedHours" name="Unplanned Breakdown (Hours)" fill="#C74646" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <div>
          <ChartCard
            title="Primary Downtime Causes"
            subtitle="Categorized maintenance hours"
          >
            <div className="h-72 w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={downtimeCauses}
                    dataKey="hours"
                    nameKey="cause"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {downtimeCauses.map((entry) => (
                      <Cell key={entry.cause} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '11px' }}
                    formatter={(val: any) => [`${val} hrs`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-1.5 w-full mt-2 text-[11px]">
                {downtimeCauses.map((c) => (
                  <div key={c.cause} className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.fill }} />
                      <span className="truncate">{c.cause}</span>
                    </span>
                    <span className="font-semibold text-slate-800 font-mono shrink-0">{c.hours} h</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
};
