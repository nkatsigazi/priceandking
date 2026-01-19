import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, Button, TextField } from '@mui/material';
import Grid from '@mui/material/Grid';
import api from '../api';

const TaskDetail = () => {
  const { taskId } = useParams();
  const [task, setTask] = useState<any>(null);
  const [memo, setMemo] = useState(''); // State for the text box

  const fetchTask = async () => {
    const res = await api.get(`engagement-tasks/${taskId}/`);
    setTask(res.data);
    setMemo(res.data.description || ''); // Load existing description into memo
  };

  useEffect(() => { fetchTask(); }, [taskId]);

  // FIX: Save Documentation
  const handleSave = async () => {
    try {
      await api.patch(`engagement-tasks/${taskId}/`, { description: memo });
      alert("Documentation saved successfully");
      fetchTask();
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  // FIX: Review/Sign-off Action
  const handleAction = async () => {
    try {
      await api.post(`engagement-tasks/${taskId}/sign_off/`);
      fetchTask(); // Refresh to see new sign-off status
    } catch (err: any) {
      alert(err.response?.data?.error || "Action failed");
    }
  };

  if (!task) return null;

  return (
    <Box sx={{ p: 4 }}>
       {/* ... Header Code ... */}

       <Grid container spacing={3}>
         <Grid size={{ xs: 8 }}>
           <Paper sx={{ p: 3 }}>
             <Typography variant="h6">Audit Memo</Typography>
             <TextField 
                multiline rows={10} fullWidth 
                value={memo} 
                onChange={(e) => setMemo(e.target.value)} 
                sx={{ mt: 2 }}
             />
             <Button 
                variant="contained" 
                onClick={handleSave} // Linked Save function
                sx={{ mt: 2 }}
             >
                Save Workpaper
             </Button>
           </Paper>
         </Grid>

         <Grid size={{ xs: 4 }}>
           <Paper sx={{ p: 3 }}>
             <Typography variant="h6">Sign-offs</Typography>
             
             <Box sx={{ my: 2 }}>
               <Typography variant="caption">Prepared By:</Typography>
               <Typography variant="body1">{task.assignee_name || 'Unsigned'}</Typography>
             </Box>

             <Box sx={{ my: 2 }}>
               <Typography variant="caption">Reviewed By:</Typography>
               <Typography variant="body1">{task.reviewed_by_name || 'Pending'}</Typography>
             </Box>

             <Button 
                fullWidth 
                variant="outlined" 
                color="primary"
                disabled={task.status === 'DONE'}
                onClick={handleAction} // Linked Sign-off function
             >
                {task.status === 'PENDING' ? 'Sign off as Preparer' : 'Sign off as Reviewer'}
             </Button>
           </Paper>
         </Grid>
       </Grid>
    </Box>
  );
};

export default TaskDetail;