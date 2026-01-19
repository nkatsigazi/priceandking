import { useEffect, useState } from 'react';
import {
  Paper, Typography, Box, Button, Grid, Card, CardContent,
  IconButton, Dialog, DialogTitle, DialogContent, TextField,
  DialogActions, Chip, LinearProgress, InputAdornment
} from '@mui/material';
import {
  UploadFile, InsertDriveFile, Download, Delete,
  Shield, Search, PictureAsPdf, Description, TableChart
} from '@mui/icons-material';
import api from '../api';

// ---------------- TYPES ----------------
interface Doc {
  id: number;
  description: string;
  file: string;
  uploaded_at: string;
  uploader_name: string;
  is_verified: boolean;
}

// ---------------- COMPONENT ----------------
const EngagementDocs = ({ engagementId }: { engagementId: number }) => {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [desc, setDesc] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // ---------------- FETCH ----------------
  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await api.get(`documents/?engagement=${engagementId}`);
      setDocs(res.data);
    } catch (err) {
      console.error('Fetch failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [engagementId]);

  // ---------------- DRAG & DROP ----------------
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  // ---------------- UPLOAD ----------------
  const handleUpload = async () => {
    if (!file || !desc) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', desc);
    formData.append('engagement', engagementId.toString());

    try {
      await api.post('documents/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setOpen(false);
      setFile(null);
      setDesc('');
      fetchDocs();
    } catch {
      alert('Upload failed. Check backend serializer.');
    }
  };

  // ---------------- HELPERS ----------------
  const getFileIcon = (name: string) => {
    if (name.endsWith('.pdf')) return <PictureAsPdf sx={{ color: '#f44336' }} />;
    if (name.endsWith('.xlsx') || name.endsWith('.csv'))
      return <TableChart sx={{ color: '#4caf50' }} />;
    return <Description sx={{ color: '#2196f3' }} />;
  };

  const filteredDocs = docs.filter(d =>
    d.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ---------------- RENDER ----------------
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <TextField
          size="small"
          placeholder="Search workpapers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300, bgcolor: 'white' }}
        />

        <Button
          startIcon={<UploadFile />}
          variant="contained"
          onClick={() => setOpen(true)}
        >
          New Workpaper
        </Button>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Documents */}
      <Grid container spacing={2}>
        {filteredDocs.map(doc => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={doc.id}>
            <Card sx={{ borderRadius: 2, '&:hover': { boxShadow: 4 } }}>
              <CardContent>
                <Box sx={{ display: 'flex', mb: 2 }}>
                  <Box sx={{ mr: 2 }}>{getFileIcon(doc.file)}</Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography fontWeight="bold" noWrap>
                      {doc.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(doc.uploaded_at).toLocaleDateString()} • {doc.uploader_name}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
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

      {/* Empty State */}
      {!loading && filteredDocs.length === 0 && (
        <Paper sx={{ p: 8, textAlign: 'center', border: '2px dashed #ddd' }}>
          <InsertDriveFile sx={{ fontSize: 60, color: '#ccc' }} />
          <Typography>No workpapers found</Typography>
        </Paper>
      )}

      {/* Upload Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Upload Workpaper</DialogTitle>

        <DialogContent>
          <TextField
            label="Document Title"
            fullWidth
            variant="filled"
            margin="normal"
            value={desc}
            onChange={e => setDesc(e.target.value)}
          />

          <Box
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            sx={{
              mt: 2,
              p: 4,
              border: '2px dashed',
              borderColor: isDragging ? 'primary.main' : '#ccc',
              bgcolor: isDragging ? '#e3f2fd' : '#fafafa',
              borderRadius: 2,
              textAlign: 'center',
            }}
          >
            <input
              type="file"
              hidden
              id="file-input"
              onChange={e =>
                setFile(e.target.files ? e.target.files[0] : null)
              }
            />

            <label htmlFor="file-input" style={{ cursor: 'pointer' }}>
              <UploadFile sx={{ fontSize: 40 }} />
              <Typography variant="body2">
                {file ? `Selected: ${file.name}` : 'Drag & drop or click to browse'}
              </Typography>
            </label>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpload} disabled={!file || !desc}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EngagementDocs;