'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface MonitorStats {
  id: number;
  cpu_percent: number;
  memory_usage: number; // MB
  created_at: string;
}

export default function MonitorPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<MonitorStats[]>([]);
  const [timeRange, setTimeRange] = useState(360); // 1 hour (360 * 10s)

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.username !== 'root') {
        router.push('/');
      }
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user || user.username !== 'root' || !token) return;

    const fetchData = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        const res = await fetch(`${apiBase}/monitor?limit=${timeRange}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.ok) {
          const stats: MonitorStats[] = await res.json();
          // Format timestamps for display
          const formattedStats = stats.map(s => ({
            ...s,
            displayTime: new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          }));
          setData(formattedStats);
        } else {
            if (res.status === 401 || res.status === 403) {
                 router.push('/');
            }
        }
      } catch (error) {
        console.error('Failed to fetch monitor stats:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [user, token, router, timeRange]);

  const stats = useMemo(() => {
    if (data.length === 0) return { maxCpu: 0, avgCpu: 0, maxMem: 0, avgMem: 0, currentCpu: 0, currentMem: 0 };

    const maxCpu = Math.max(...data.map(d => d.cpu_percent));
    const avgCpu = data.reduce((acc, curr) => acc + curr.cpu_percent, 0) / data.length;
    const maxMem = Math.max(...data.map(d => d.memory_usage));
    const avgMem = data.reduce((acc, curr) => acc + curr.memory_usage, 0) / data.length;
    const current = data[data.length - 1];

    return {
      maxCpu,
      avgCpu,
      maxMem,
      avgMem,
      currentCpu: current.cpu_percent,
      currentMem: current.memory_usage
    };
  }, [data]);

  if (isLoading || !user || user.username !== 'root') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Monitor</h1>
            <div className="flex space-x-2">
                <button
                    onClick={() => setTimeRange(360)}
                    className={`px-4 py-2 rounded ${timeRange === 360 ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                >
                    Last Hour
                </button>
                <button
                    onClick={() => setTimeRange(8640)}
                    className={`px-4 py-2 rounded ${timeRange === 8640 ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                >
                    Last 24 Hours
                </button>
            </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Current CPU" value={`${stats.currentCpu.toFixed(1)}%`} color="text-blue-600" />
          <StatCard title="Avg CPU (Period)" value={`${stats.avgCpu.toFixed(1)}%`} color="text-blue-500" />
          <StatCard title="Current Memory" value={`${stats.currentMem.toFixed(1)} MB`} color="text-purple-600" />
          <StatCard title="Max Memory (Period)" value={`${stats.maxMem.toFixed(1)} MB`} color="text-purple-500" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-8">
            {/* CPU Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">CPU Usage History</h2>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="displayTime" />
                    <YAxis label={{ value: '%', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="cpu_percent" stroke="#2563eb" dot={false} name="CPU Usage %" />
                </LineChart>
                </ResponsiveContainer>
            </div>
            </div>

            {/* Memory Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Memory Usage History</h2>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="displayTime" />
                    <YAxis label={{ value: 'MB', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="memory_usage" stroke="#9333ea" dot={false} name="Memory (MB)" />
                </LineChart>
                </ResponsiveContainer>
            </div>
            </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string, value: string, color: string }) {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</h3>
            <div className={`mt-2 text-3xl font-bold ${color}`}>
                {value}
            </div>
        </div>
    )
}
