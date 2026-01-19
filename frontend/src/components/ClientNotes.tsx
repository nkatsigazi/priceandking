import { useEffect, useState } from 'react';
import { 
  Paper, Typography, Box, Chip, TextField, Button, List, ListItem, 
  ListItemText, Divider, Avatar, IconButton, Tooltip, Fade 
} from '@mui/material';
import { Send, CheckCircle, RadioButtonUnchecked, ChatBubbleOutline } from '@mui/icons-material';
import api from '../api';

interface Note {
  id: number;
  content: string;
  author_name: string;
  created_at: string;
  is_resolved: boolean;
}

const ClientNotes = ({ clientId, onNotesCountChange }: { clientId: number, onNotesCountChange?: (count: number) => void }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');

  const fetchNotes = async () => {
    const res = await api.get(`notes/?client=${clientId}`);
    const activeNotes = res.data.filter((n: any) => !n.is_resolved);
    setNotes(res.data);
    if (onNotesCountChange) onNotesCountChange(activeNotes.length);
  };

  useEffect(() => { fetchNotes(); }, [clientId]);

  const handleSubmit = async () => {
    if (!newNote.trim()) return;
    await api.post('notes/', { client: clientId, content: newNote });
    setNewNote('');
    fetchNotes();
  };

  const toggleResolve = async (id: number, currentStatus: boolean) => {
    try {
      // Force the trailing slash back in — 
      // Django almost always prefers it, and the 500 proved the path was found.
      await api.patch(`notes/${id}/`, { 
        is_resolved: !currentStatus 
      }); 
      
      setNotes(notes.map(n => n.id === id ? { ...n, is_resolved: !currentStatus } : n));
    } catch (err) {
      console.error("Backend failed to save. Check terminal for Traceback.");
    }
  };

  return (
    <Paper sx={{ p: 0, mt: 2, display: 'flex', flexDirection: 'column', borderRadius: 3, overflow: 'hidden', border: '1px solid #e0e4e8', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
      {/* Header */}
      <Box sx={{ p: 2, bgcolor: '#f8fafc', borderBottom: '1px solid #e0e4e8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ChatBubbleOutline sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="subtitle1" fontWeight="800">Internal Audit Notes ({notes.length})</Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">Internal only — not visible to client</Typography>
      </Box>

      {/* Input */}
      <Box sx={{ p: 2, display: 'flex', gap: 1, bgcolor: '#fff' }}>
        <TextField 
          fullWidth 
          size="small" 
          variant="outlined"
          placeholder="Type an internal observation..." 
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
        <Button variant="contained" onClick={handleSubmit} sx={{ borderRadius: 2, minWidth: 48, boxShadow: 'none' }}>
          <Send fontSize="small" />
        </Button>
      </Box>

      {/* Notes List */}
      <List sx={{ maxHeight: 400, overflow: 'auto', p: 0, bgcolor: '#ffffff' }}>
        {notes.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">No notes or flags recorded.</Typography>
          </Box>
        ) : notes.map((note, index) => (
          <Fade in={true} key={note.id}>
            <Box>
              <ListItem 
                alignItems="flex-start" 
                sx={{ 
                  transition: '0.2s',
                  bgcolor: note.is_resolved ? 'transparent' : '#f0f7ff33',
                  '&:hover': { bgcolor: '#f8fafc' }
                }}
                secondaryAction={
                  <Tooltip title={note.is_resolved ? "Re-open" : "Mark Resolved"}>
                    <IconButton edge="end" onClick={() => toggleResolve(note.id, note.is_resolved)}>
                      {note.is_resolved ? 
                        <CheckCircle color="success" sx={{ fontSize: 22 }} /> : 
                        <RadioButtonUnchecked sx={{ color: '#cbd5e0', fontSize: 22 }} />
                      }
                    </IconButton>
                  </Tooltip>
                }
              >
                <Avatar sx={{ width: 32, height: 32, mr: 2, mt: 0.5, fontSize: '0.8rem', bgcolor: note.is_resolved ? '#cbd5e0' : 'primary.main' }}>
                  {note.author_name?.[0] || 'S'}
                </Avatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2" fontWeight="700" sx={{ color: note.is_resolved ? 'text.secondary' : 'text.primary' }}>
                        {note.author_name}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        • {new Date(note.created_at).toLocaleDateString()}
                      </Typography>
                      {!note.is_resolved && (
                        <Chip label="Active" size="small" sx={{ height: 16, fontSize: '0.6rem', bgcolor: '#ebf8ff', color: '#2b6cb0', fontWeight: 700 }} />
                      )}
                    </Box>
                  }
                  secondary={
                    <Typography 
                      variant="body2" 
                      sx={{ mt: 0.5, color: note.is_resolved ? 'text.secondary' : 'text.primary', textDecoration: note.is_resolved ? 'line-through' : 'none', fontStyle: note.is_resolved ? 'italic' : 'normal' }}
                    >
                      {note.content}
                    </Typography>
                  }
                />
              </ListItem>
              {index < notes.length - 1 && <Divider component="li" sx={{ opacity: 0.5 }} />}
            </Box>
          </Fade>
        ))}
      </List>
    </Paper>
  );
};

export default ClientNotes;