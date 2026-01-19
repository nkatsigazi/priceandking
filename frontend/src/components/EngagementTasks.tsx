import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Card, Typography, Table, TableBody, TableCell, 
  TableHead, TableRow, Chip, Button, Dialog, DialogTitle, 
  DialogContent, TextField, DialogActions, IconButton, Tooltip 
} from '@mui/material';
import { Add, Delete, CheckCircle, RateReview } from '@mui/icons-material';
import api from '../api';

// --- Types ---
interface Task {
  id: number;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  due_date: string | null;
  assignee_name?: string;
  prepared_by?: number;
  reviewed_by?: number;
  is_milestone: boolean;
}

interface EngagementTasksProps {
  engagementId: number;
  onUpdate: () => void; // Function to refresh parent progress bar
}

const EngagementTasks: React.FC<EngagementTasksProps> = ({ engagementId, onUpdate }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [open, setOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', due_date: '' });

  const navigate = useNavigate();
  
  const fetchTasks = async () => {
    try {
      const res = await api.get<Task[]>(`engagement-tasks/?engagement=${engagementId}`);
      setTasks(res.data);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [engagementId]);

  const handleSignOff = async (taskId: number) => {
    try {
      await api.post(`engagement-tasks/${taskId}/sign_off/`);
      fetchTasks();
      onUpdate(); 
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Sign-off failed";
      alert(errorMsg);
    }
  };

  const handleDelete = async (taskId: number) => {
    if (window.confirm("Remove this audit procedure? This cannot be undone.")) {
      try {
        await api.delete(`engagement-tasks/${taskId}/`);
        fetchTasks();
        onUpdate();
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
  };

  const handleAddTask = async () => {
    try {
      await api.post('engagement-tasks/', {
        engagement: engagementId,
        title: newTask.title,
        due_date: newTask.due_date,
        status: 'PENDING'
      });
      setOpen(false);
      setNewTask({ title: '', due_date: '' });
      fetchTasks();
      onUpdate();
    } catch (err) {
      console.error("Add task failed", err);
    }
  };

  return (
    <Box>
      <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
          <Typography variant="h6" fontWeight="bold">Audit Checklist / Program</Typography>
          <Button startIcon={<Add />} variant="contained" onClick={() => setOpen(true)} size="small">
            Add Procedure
          </Button>
        </Box>
        
        <Table>
          <TableHead sx={{ bgcolor: '#f8f9fa' }}>
            <TableRow>
              <TableCell width="60">Status</TableCell>
              <TableCell>Audit Procedure</TableCell>
              <TableCell>Sign-offs</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id} hover>
                <TableCell>
                  <Tooltip title={task.status === 'DONE' ? "Fully Reviewed" : "Sign Off / Advance"}>
                    <span>
                      <IconButton 
                        onClick={() => handleSignOff(task.id)}
                        color={task.status === 'DONE' ? "success" : task.status === 'REVIEW' ? "warning" : "default"}
                        disabled={task.status === 'DONE'}
                      >
                        {task.status === 'DONE' ? <CheckCircle /> : <RateReview />}
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600, textDecoration: task.status === 'DONE' ? 'line-through' : 'none', color: task.status === 'DONE' ? 'text.secondary' : 'text.primary' }} onClick={() => navigate(`/engagements/${engagementId}/tasks/${task.id}`)}>
                    {task.title}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {task.prepared_by && <Chip label="Prepared" size="small" color="primary" variant="outlined" sx={{ fontSize: '10px' }} />}
                    {task.reviewed_by && <Chip label="Reviewed" size="small" color="success" variant="outlined" sx={{ fontSize: '10px' }} />}
                    {!task.prepared_by && <Typography variant="caption" color="text.disabled">No sign-offs</Typography>}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="caption">{task.due_date || 'TBD'}</Typography>
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleDelete(task.id)} color="error" size="small" sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}>
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Add New Audit Procedure</DialogTitle>
        <DialogContent sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: '400px' }}>
          <TextField 
            autoFocus
            label="Procedure Title" 
            fullWidth 
            variant="outlined"
            value={newTask.title} 
            onChange={e => setNewTask({...newTask, title: e.target.value})} 
          />
          <TextField 
            type="date" 
            label="Target Completion Date" 
            InputLabelProps={{shrink: true}} 
            fullWidth 
            onChange={e => setNewTask({...newTask, due_date: e.target.value})} 
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={handleAddTask} disabled={!newTask.title}>Add to Program</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EngagementTasks;