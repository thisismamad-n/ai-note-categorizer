'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Trophy, TrendingUp, PieChart } from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Pie } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

interface AnalyticsProps {
  notes: Array<{
    id: string
    content: string
    category: string
    timestamp: string
    author: {
      name: string
      avatar: string
    }
  }>
}

export default function Analytics({ notes }: AnalyticsProps) {
  const [timeRange, setTimeRange] = useState('week')

  // Calculate daily note counts
  const getDailyNoteCounts = () => {
    const counts: { [key: string]: number } = {}
    const today = new Date()
    const days = timeRange === 'week' ? 7 : 30

    // Initialize all dates with 0
    for (let i = 0; i < days; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      counts[date.toISOString().split('T')[0]] = 0
    }

    // Count notes per day
    notes.forEach(note => {
      const date = note.timestamp.split('T')[0]
      if (counts[date] !== undefined) {
        counts[date]++
      }
    })

    return counts
  }

  // Calculate category distribution
  const getCategoryDistribution = () => {
    const distribution: { [key: string]: number } = {}
    notes.forEach(note => {
      distribution[note.category] = (distribution[note.category] || 0) + 1
    })
    return distribution
  }

  // Calculate team leaderboard
  const getTeamLeaderboard = () => {
    const leaderboard: { [key: string]: number } = {}
    notes.forEach(note => {
      leaderboard[note.author.name] = (leaderboard[note.author.name] || 0) + 1
    })
    return Object.entries(leaderboard)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
  }

  // Prepare data for daily notes chart
  const dailyData = {
    labels: Object.keys(getDailyNoteCounts()).reverse(),
    datasets: [
      {
        label: 'Notes Created',
        data: Object.values(getDailyNoteCounts()).reverse(),
        borderColor: 'rgb(249, 168, 212)',
        backgroundColor: 'rgba(249, 168, 212, 0.5)',
        tension: 0.4,
      },
    ],
  }

  // Prepare data for category distribution chart
  const categoryData = {
    labels: Object.keys(getCategoryDistribution()),
    datasets: [
      {
        data: Object.values(getCategoryDistribution()),
        backgroundColor: [
          'rgba(249, 168, 212, 0.8)',
          'rgba(216, 180, 254, 0.8)',
          'rgba(129, 140, 248, 0.8)',
          'rgba(147, 197, 253, 0.8)',
          'rgba(156, 163, 175, 0.8)',
          'rgba(251, 146, 60, 0.8)',
        ],
      },
    ],
  }

  return (
    <div className="space-y-8">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Analytics</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Select Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last 7 Days</SelectItem>
            <SelectItem value="month">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notes.length}</div>
            <p className="text-xs text-muted-foreground">
              +{Object.values(getDailyNoteCounts())[0]} today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories Used</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(getCategoryDistribution()).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Most used: {Object.entries(getCategoryDistribution()).sort(([,a], [,b]) => b - a)[0]?.[0]}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Ranking</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{getTeamLeaderboard()[0]?.[1] || 0}</div>
            <p className="text-xs text-muted-foreground">
              Top contributor today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Notes Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <Line
              data={dailyData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                    },
                  },
                },
              }}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <Pie
              data={categoryData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom' as const,
                  },
                },
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Team Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Team Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getTeamLeaderboard().map(([name, count], index) => (
              <div key={name} className="flex items-center gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-muted-foreground w-4">{index + 1}</span>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={notes.find(n => n.author.name === name)?.author.avatar} />
                    <AvatarFallback>{name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{count} notes</span>
                  {index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 