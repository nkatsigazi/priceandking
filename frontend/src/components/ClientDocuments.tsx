import React, { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Chip,
} from '@mui/material';
import {
  UploadFile,
  Download,
  Delete,
  Shield,
  Description,
  PictureAsPdf,
  TableChart
} from '@mui/icons-material';
import api from '../api';

interface Doc {
  id: number;
  description: string;
  file: string;
  uploaded_at: string;
  uploader_name: string;
  engagement: number | null;
  is_verified: boolean;
}

const ClientDocuments = ({ clientId }: { clientId: number }) => {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  // ---------------- FETCH ----------------
  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await api.get(`documents/?client=${clientId}`);
      setDocs(res.data);
    } catch (err) {
      console.error('Failed to fetch client documents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [clientId]);

  // ---------------- UPLOAD ----------------
  const handleUpload = async () => {
    if (!file || !desc) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', desc);
    formData.append('client', clientId.toString());

    try {
      await api.post('documents/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setOpen(false);
      setDesc('');
      setFile(null);
      fetchDocs();
    } catch (err) {
      console.error('Upload failed', err);
    }
  };

    const getFileIcon = (filename: string) => {
    if (!filename) return <Description sx={{ color: '#2196f3' }} />;
    
    // Handle cases where the filename might be a full URL with query params
    const cleanName = filename.split('?')[0];
    const ext = cleanName.split('.').pop()?.toLowerCase();

    if (ext === 'pdf') {
        return <PictureAsPdf sx={{ color: '#f44336' }} />;
    }
    
    if (['xlsx', 'xls', 'csv'].includes(ext || '')) {
        return <TableChart sx={{ color: '#4caf50' }} />;
    }

    if (['doc', 'docx'].includes(ext || '')) {
        return <Description sx={{ color: '#2196f3' }} />; // Blue for Word
    }

    // Default icon for unknown types
    return <Description sx={{ color: '#757575' }} />;
    };

  // ---------------- RENDER ----------------
  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Documents
        </Typography>

        <Button
          startIcon={<UploadFile />}
          size="small"
          variant="outlined"
          onClick={() => setOpen(true)}
        >
          Upload
        </Button>
      </Box>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : docs.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No documents found.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {docs.map(doc => (
            <Grid item xs={12} md={6} lg={4} key={doc.id}>
              <Card sx={{ borderRadius: 2, '&:hover': { boxShadow: 4 } }}>
                <CardContent>
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    <Box sx={{ mr: 2 }}>{getFileIcon(doc.file)}</Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography fontWeight="bold" noWrap>
                        {doc.description}
                      </Typography>
                      {doc.engagement && (
                        <Chip 
                            label="Engagement Workpaper" 
                            size="small" 
                            variant="outlined" 
                            sx={{ height: 16, fontSize: '0.6rem', mt: 0.5 }} 
                        />
                      )}
                      <Typography variant="caption" color="text.secondary">
                        {new Date(doc.uploaded_at).toLocaleDateString()} • {doc.uploader_name}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={doc.is_verified ? 'Verified' : 'Unverified'}
                      size="small"
                      color={doc.is_verified ? 'success' : 'default'}
                      icon={<Shield sx={{ fontSize: 14 }} />}
                    />
                    <Box>
                      <IconButton href={doc.file} target="_blank" size="small">
                        <Download fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Upload Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Upload Document</DialogTitle>

        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            mt: 1,
            minWidth: 400,
          }}
        >
          <TextField
            label="Description"
            fullWidth
            value={desc}
            onChange={e => setDesc(e.target.value)}
          />

          <Button variant="outlined" component="label">
            Select File
            <input
              type="file"
              hidden
              onChange={e =>
                setFile(e.target.files ? e.target.files[0] : null)
              }
            />
          </Button>

          {file && (
            <Typography variant="caption">{file.name}</Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={!file || !desc}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ClientDocuments;