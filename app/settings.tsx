'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, X, UserPlus, Shield, Brain, Tag, Key } from 'lucide-react'

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
  avatar: string
}

interface SettingsPageProps {
  categories: string[]
  onAddCategory: (category: string) => void
  onRemoveCategory: (category: string) => void
  aiEnabled: boolean
  onToggleAI: (enabled: boolean) => void
  selectedModel: string
  onModelChange: (model: string) => void
  apiKeys: {
    openai: string
    gemini: string
    mistral: string
  }
  onApiKeyChange: (provider: string, value: string) => void
}

export default function SettingsPage({ 
  categories,
  onAddCategory,
  onRemoveCategory,
  aiEnabled,
  onToggleAI,
  selectedModel,
  onModelChange,
  apiKeys,
  onApiKeyChange
}: SettingsPageProps) {
  const [newCategory, setNewCategory] = useState('')
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [selectedRole, setSelectedRole] = useState<'admin' | 'editor' | 'viewer'>('editor')

  // Mock team members data
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
      avatar: '/avatars/john.png'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'editor',
      avatar: '/avatars/jane.png'
    },
    {
      id: '3',
      name: 'Alex Johnson',
      email: 'alex@example.com',
      role: 'viewer',
      avatar: '/avatars/alex.png'
    }
  ])

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      onAddCategory(newCategory.trim())
      setNewCategory('')
    }
  }

  const handleAddTeamMember = () => {
    if (newMemberEmail.trim() && !teamMembers.find(m => m.email === newMemberEmail.trim())) {
      setTeamMembers([...teamMembers, {
        id: Date.now().toString(),
        name: newMemberEmail.split('@')[0],
        email: newMemberEmail,
        role: selectedRole,
        avatar: '/placeholder.svg'
      }])
      setNewMemberEmail('')
    }
  }

  const handleUpdateRole = (memberId: string, newRole: 'admin' | 'editor' | 'viewer') => {
    setTeamMembers(members =>
      members.map(member =>
        member.id === memberId ? { ...member, role: newRole } : member
      )
    )
  }

  const handleRemoveMember = (memberId: string) => {
    setTeamMembers(members => members.filter(member => member.id !== memberId))
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold">Settings</h2>

      {/* AI Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Configuration
          </CardTitle>
          <CardDescription>Configure AI settings and API keys</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable AI Categorization</Label>
              <div className="text-sm text-muted-foreground">
                Let AI help categorize your notes automatically
              </div>
            </div>
            <Switch
              checked={aiEnabled}
              onCheckedChange={onToggleAI}
            />
          </div>

          {aiEnabled && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>AI Model</Label>
                <Select
                  value={selectedModel}
                  onValueChange={onModelChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select AI model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chatgpt">ChatGPT</SelectItem>
                    <SelectItem value="gemini">Gemini Pro</SelectItem>
                    <SelectItem value="mistral">Mistral</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 border rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  <Label>API Configuration</Label>
                </div>
                
                {selectedModel === 'chatgpt' && (
                  <div className="space-y-2">
                    <Label>OpenAI API Key</Label>
                    <div className="flex space-x-2">
                      <Input
                        type="password"
                        placeholder="Enter OpenAI API key"
                        value={apiKeys.openai}
                        onChange={(e) => onApiKeyChange('openai', e.target.value)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onApiKeyChange('openai', '')}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                )}

                {selectedModel === 'gemini' && (
                  <div className="space-y-2">
                    <Label>Google Gemini API Key</Label>
                    <div className="flex space-x-2">
                      <Input
                        type="password"
                        placeholder="Enter Gemini API key"
                        value={apiKeys.gemini}
                        onChange={(e) => onApiKeyChange('gemini', e.target.value)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onApiKeyChange('gemini', '')}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                )}

                {selectedModel === 'mistral' && (
                  <div className="space-y-2">
                    <Label>Mistral API Key</Label>
                    <div className="flex space-x-2">
                      <Input
                        type="password"
                        placeholder="Enter Mistral API key"
                        value={apiKeys.mistral}
                        onChange={(e) => onApiKeyChange('mistral', e.target.value)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onApiKeyChange('mistral', '')}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Category Management
          </CardTitle>
          <CardDescription>Add and remove note categories</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="New category name..."
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
            />
            <Button onClick={handleAddCategory}>
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Badge
                key={category}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {category}
                <button
                  onClick={() => onRemoveCategory(category)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Team Management
          </CardTitle>
          <CardDescription>Manage team members and their permissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2">
            <Input
              placeholder="team@example.com"
              type="email"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTeamMember()}
            />
            <Select value={selectedRole} onValueChange={(value: any) => setSelectedRole(value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAddTeamMember}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          <div className="space-y-4">
            {teamMembers.map(member => (
              <div key={member.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>{member.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={member.role}
                    onValueChange={(value: any) => handleUpdateRole(member.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMember(member.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 