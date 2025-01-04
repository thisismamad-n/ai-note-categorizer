'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { GripVertical, Trash2 } from 'lucide-react'

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

interface SortableNoteProps {
  note: Note
  isAdmin: boolean
  onDelete: () => void
}

export function SortableNote({ note, isAdmin, onDelete }: SortableNoteProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: note.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="hover:shadow-lg transition-shadow group">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <div
              className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <Avatar className="h-6 w-6">
              <AvatarImage src={note.author.avatar} />
              <AvatarFallback>{note.author.name[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{note.author.name}</span>
            <span className="text-xs text-muted-foreground ml-auto">
              {new Date(note.timestamp).toLocaleDateString()}
            </span>
            {isAdmin && (
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-sm mb-3">{note.content}</p>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded-full bg-secondary text-secondary-foreground text-xs">
              {note.category}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 