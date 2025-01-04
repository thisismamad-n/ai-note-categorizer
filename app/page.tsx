'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Brain, Settings as SettingsIcon, LogOut, Plus, Search, BarChart3, Users2, Filter, Calendar } from 'lucide-react'
import { categorizeNote } from './actions'
import Analytics from './analytics'
import SettingsPage from './settings'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { SortableNote } from '@/components/sortable-note'

interface Note {
  id: string
  content: string
  category: string
  timestamp: string
  author: {
    name: string
    avatar: string
  }
}

interface TeamMember {
  id: string
  name: string
  avatar: string
}

export default function NoteCategorizer() {
  const [notes, setNotes] = useState<Note[]>([])
  const [note, setNote] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [memberFilter, setMemberFilter] = useState<string>('all')
  const [categories, setCategories] = useState(['Work', 'Personal', 'Ideas', 'Tasks', 'Meetings', 'Research'])
  const [selectedModel, setSelectedModel] = useState('chatgpt')
  const [showTeamNotes, setShowTeamNotes] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [aiEnabled, setAiEnabled] = useState(true)
  const [apiKeys, setApiKeys] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedKeys = localStorage.getItem('ai-note-categorizer-api-keys')
      return savedKeys ? JSON.parse(savedKeys) : {
        openai: '',
        gemini: '',
        mistral: ''
      }
    }
    return {
      openai: '',
      gemini: '',
      mistral: ''
    }
  })
  const [isAdmin, setIsAdmin] = useState(true)

  const filterNotesByDate = (notes: Note[]) => {
    return notes.filter(note => {
      if (dateFilter === 'all') return true;

      try {
        const noteDate = new Date(note.timestamp);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch (dateFilter) {
          case 'today': {
            const noteDateStart = new Date(noteDate);
            noteDateStart.setHours(0, 0, 0, 0);
            return noteDateStart.getTime() === today.getTime();
          }
          case 'week': {
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return noteDate >= weekAgo;
          }
          case 'month': {
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return noteDate >= monthAgo;
          }
          default:
            return true;
        }
      } catch (error) {
        console.error('Error filtering note by date:', error, note.timestamp);
        return true;
      }
    });
  };

  const filteredNotes = filterNotesByDate(
    notes.filter(note => {
      const matchesSearch = note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           note.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || note.category === categoryFilter;
      const matchesMember = memberFilter === 'all' || note.author.name === memberFilter;
      
      return matchesSearch && matchesCategory && matchesMember;
    })
  );

  const currentUser = {
    name: 'User Name',
    email: 'user@example.com',
    avatar: '/placeholder.svg'
  }

  // Mock team members data
  const teamMembers: TeamMember[] = [
    { id: '1', name: 'John Doe', avatar: '/avatars/john.png' },
    { id: '2', name: 'Jane Smith', avatar: '/avatars/jane.png' },
    { id: '3', name: 'Alex Johnson', avatar: '/avatars/alex.png' },
  ]

  const handleCategorize = async () => {
    if (!note.trim()) return;

    if (!aiEnabled) {
      alert('Please enable AI categorization in settings first.')
      return
    }

    if (!apiKeys[selectedModel as keyof typeof apiKeys]) {
      alert(`Please configure the ${selectedModel} API key in settings first.`)
      return
    }

    try {
      const category = await categorizeNote(note, {
        model: selectedModel,
        apiKey: apiKeys[selectedModel as keyof typeof apiKeys]
      })

      const newNote: Note = {
        id: Date.now().toString(),
        content: note,
        category,
        timestamp: new Date().toISOString(),
        author: {
          name: currentUser.name,
          avatar: currentUser.avatar
        }
      }
      setNotes([newNote, ...notes])
      setNote('')
    } catch (error) {
      console.error('Error categorizing note:', error)
      if (error instanceof Error) {
        alert(`Failed to categorize note: ${error.message}`)
      } else {
        alert('Failed to categorize note. Please check your API configuration.')
      }
    }
  }

  const handleAddCategory = (category: string) => {
    if (!categories.includes(category)) {
      setCategories([...categories, category])
    }
  }

  const handleRemoveCategory = (category: string) => {
    setCategories(categories.filter(c => c !== category))
  }

  // Calculate streak and activity data
  const calculateStreak = () => {
    if (notes.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let currentStreak = 0;
    let previousDate = today;

    // Sort notes by date, newest first
    const sortedNotes = [...notes].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Check if there's activity today
    const hasActivityToday = sortedNotes.some(note => {
      const noteDate = new Date(note.timestamp);
      noteDate.setHours(0, 0, 0, 0);
      return noteDate.getTime() === today.getTime();
    });

    if (!hasActivityToday) return 0;

    // Calculate streak
    for (let i = 0; i < sortedNotes.length; i++) {
      const noteDate = new Date(sortedNotes[i].timestamp);
      noteDate.setHours(0, 0, 0, 0);

      // If this note is from the same day as previous, skip to next note
      if (noteDate.getTime() === previousDate.getTime()) {
        continue;
      }

      // If this note is from the previous day, increment streak
      const expectedPreviousDay = new Date(previousDate);
      expectedPreviousDay.setDate(expectedPreviousDay.getDate() - 1);
      
      if (noteDate.getTime() === expectedPreviousDay.getTime()) {
        currentStreak++;
        previousDate = noteDate;
      } else {
        break;
      }
    }

    return currentStreak + 1; // Add 1 for today
  };

  // Calculate activity metrics
  const activityMetrics = {
    streak: calculateStreak(),
    totalNotes: notes.length,
    todayNotes: notes.filter(note => {
      const noteDate = new Date(note.timestamp);
      const today = new Date();
      return noteDate.toDateString() === today.toDateString();
    }).length,
  };

  const remainingDays = Math.max(0, 7 - activityMetrics.streak);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setNotes((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleDeleteNote = (noteId: string) => {
    if (!isAdmin) {
      alert('Only admin users can delete notes')
      return
    }

    if (confirm('Are you sure you want to delete this note?')) {
      setNotes(notes.filter(note => note.id !== noteId))
    }
  }

  const handleApiKeyChange = (provider: string, value: string) => {
    const newApiKeys = { ...apiKeys, [provider]: value }
    setApiKeys(newApiKeys)
    if (typeof window !== 'undefined') {
      localStorage.setItem('ai-note-categorizer-api-keys', JSON.stringify(newApiKeys))
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 border-r bg-card p-4 h-screen flex flex-col fixed">
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6" />
              <h1 className="font-semibold">AI Categorizer</h1>
            </div>
            <ThemeToggle />
          </div>
          
          <div className="mt-8 space-y-2">
            <div 
              className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer ${showTeamNotes && !showAnalytics && !showSettings ? 'bg-accent' : 'text-muted-foreground hover:bg-accent'}`}
              onClick={() => {
                setShowTeamNotes(true)
                setShowAnalytics(false)
                setShowSettings(false)
              }}
            >
              <Users2 className="h-5 w-5" />
              <span>Team Notes</span>
            </div>
            <div 
              className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer ${!showTeamNotes && !showAnalytics && !showSettings ? 'bg-accent' : 'text-muted-foreground hover:bg-accent'}`}
              onClick={() => {
                setShowTeamNotes(false)
                setShowAnalytics(false)
                setShowSettings(false)
              }}
            >
              <Brain className="h-5 w-5" />
              <span>My Notes</span>
            </div>
            <div 
              className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer ${showAnalytics ? 'bg-accent' : 'text-muted-foreground hover:bg-accent'}`}
              onClick={() => {
                setShowAnalytics(true)
                setShowTeamNotes(false)
                setShowSettings(false)
              }}
            >
              <BarChart3 className="h-5 w-5" />
              <span>Analytics</span>
            </div>
            <div 
              className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer ${showSettings ? 'bg-accent' : 'text-muted-foreground hover:bg-accent'}`}
              onClick={() => {
                setShowSettings(true)
                setShowAnalytics(false)
                setShowTeamNotes(false)
              }}
            >
              <SettingsIcon className="h-5 w-5" />
              <span>Settings</span>
            </div>
          </div>

          <div className="mt-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 px-4 py-2 hover:bg-accent rounded-lg cursor-pointer">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>UN</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">User Name</span>
                    <span className="text-xs text-muted-foreground">user@example.com</span>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Content */}
        <div className="ml-64 flex-1 p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {showSettings ? (
              <SettingsPage
                categories={categories}
                onAddCategory={handleAddCategory}
                onRemoveCategory={handleRemoveCategory}
                aiEnabled={aiEnabled}
                onToggleAI={setAiEnabled}
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
                apiKeys={apiKeys}
                onApiKeyChange={handleApiKeyChange}
              />
            ) : showAnalytics ? (
              <Analytics notes={notes} />
            ) : showTeamNotes ? (
              <>
                {/* Team Notes Filters */}
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger>
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Filter by Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger>
                        <Calendar className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Filter by Date" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select value={memberFilter} onValueChange={setMemberFilter}>
                      <SelectTrigger>
                        <Users2 className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Filter by Member" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Members</SelectItem>
                        {teamMembers.map(member => (
                          <SelectItem key={member.id} value={member.name}>{member.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search notes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Stats Card */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="bg-gradient-to-br from-pink-500 to-rose-500 text-white">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold">{activityMetrics.streak} day streak</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col">
                        <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-bold">{activityMetrics.totalNotes}</span>
                          <span className="text-xl text-pink-100">({activityMetrics.todayNotes} today)</span>
                        </div>
                        <span className="text-pink-100">total notes categorized</span>
                        <div className="mt-4 flex gap-2">
                          {Array.from({ length: 7 }).map((_, i) => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full ${
                                i < activityMetrics.streak ? 'bg-white' : 'bg-pink-300/50'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="mt-2 text-sm text-pink-100">
                          {remainingDays > 0
                            ? `Keep it up, you're ${remainingDays} days away from a 7 day streak!`
                            : "Amazing! You've achieved a 7 day streak! 🎉"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {aiEnabled ? (
                        <Select value={selectedModel} onValueChange={setSelectedModel}>
                          <SelectTrigger>
                            <Brain className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Select AI Model" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="chatgpt">ChatGPT</SelectItem>
                            <SelectItem value="gemini">Gemini Pro</SelectItem>
                            <SelectItem value="mistral">Mistral</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
                          <div className="flex items-center gap-2">
                            <Brain className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">AI categorization is disabled</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowSettings(true)
                              setShowAnalytics(false)
                              setShowTeamNotes(false)
                            }}
                          >
                            Enable
                          </Button>
                        </div>
                      )}
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search notes..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Note Input */}
                <Card>
                  <CardContent className="pt-6">
                    <Textarea
                      placeholder="Enter your note here..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="min-h-[100px] mb-4"
                    />
                    <Button onClick={handleCategorize} className="w-full">
                      <Brain className="mr-2 h-4 w-4" />
                      Categorize Note
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Notes Grid */}
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <SortableContext
                  items={filteredNotes}
                  strategy={verticalListSortingStrategy}
                >
                  {filteredNotes.map((note) => (
                    <SortableNote
                      key={note.id}
                      note={note}
                      isAdmin={isAdmin}
                      onDelete={() => handleDeleteNote(note.id)}
                    />
                  ))}
                </SortableContext>
              </div>
            </DndContext>
          </div>
        </div>
      </div>
    </div>
  )
}

