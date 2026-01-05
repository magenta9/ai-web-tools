'use client';

import { useEffect, useState } from 'react';
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
  cpu_percent: number;
  memory_usage: number; // MB
  timestamp: string;
}

export default function MonitorPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<MonitorStats[]>([]);
  const [currentStats, setCurrentStats] = useState<MonitorStats | null>(null);

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
        const res = await fetch(`${apiBase}/monitor`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.ok) {
          const stats = await res.json();
          const newStat = {
            ...stats,
            timestamp: new Date().toLocaleTimeString()
          };
          setCurrentStats(newStat);
          setData(prev => {
            const newData = [...prev, newStat];
            if (newData.length > 30) {
              return newData.slice(newData.length - 30);
            }
            return newData;
          });
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
    const interval = setInterval(fetchData, 2000);

    return () => clearInterval(interval);
  }, [user, token, router]);

  if (isLoading || !user || user.username !== 'root') {
    return null; // Or a loading spinner
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">System Monitor</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Current CPU Usage</h2>
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
              {currentStats?.cpu_percent.toFixed(1)}%
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Current Memory Usage</h2>
            <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">
              {currentStats?.memory_usage.toFixed(1)} MB
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Real-time Performance</h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis yAxisId="left" label={{ value: 'CPU (%)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Memory (MB)', angle: 90, position: 'insideRight' }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="cpu_percent" stroke="#2563eb" name="CPU %" isAnimationActive={false} />
                <Line yAxisId="right" type="monotone" dataKey="memory_usage" stroke="#9333ea" name="Memory (MB)" isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}
