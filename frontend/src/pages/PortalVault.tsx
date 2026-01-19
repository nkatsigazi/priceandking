import React, { useEffect, useState } from 'react';
import { 
    Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Chip, IconButton, Button, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { 
    Download, Delete, PictureAsPdf, Description, TableChart, InsertDriveFile, Warning 
} from '@mui/icons-material';
import api from '../api';

const getFileIcon = (fileName: string) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <PictureAsPdf sx={{ color: '#E11D48' }} />;
    if (['xlsx', 'csv', 'xls'].includes(ext!)) return <TableChart sx={{ color: '#16A34A' }} />;
    if (['doc', 'docx'].includes(ext!)) return <Description sx={{ color: '#2563EB' }} />;
    return <InsertDriveFile sx={{ color: '#64748B' }} />;
};

const PortalVault = () => {
    const [docs, setDocs] = useState([]);

    const fetchDocs = async () => {
        const res = await api.get('portal/documents/');
        setDocs(res.data);
    };

    const handleDownload = (url: string, fileName: string) => {
        // Correct way to trigger download from DRF protected media
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    useEffect(() => { fetchDocs(); }, []);

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>Document Vault</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Review and manage all historical uploads for your audit engagements.
            </Typography>

            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                        <TableRow>
                            <TableCell>Document Name</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Size</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {docs.map((doc: any) => (
                            <TableRow key={doc.id} hover>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        {getFileIcon(doc.file_name)}
                                        <Box>
                                            <Typography variant="body2" fontWeight={600}>{doc.file_name}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Chip label={doc.category || 'Uncategorized'} size="small" variant="outlined" />
                                </TableCell>
                                <TableCell><Typography variant="caption">2.4 MB</Typography></TableCell>
                                <TableCell>
                                    <Chip 
                                        label={doc.is_verified ? "Audit Verified" : "Pending Review"} 
                                        color={doc.is_verified ? "success" : "warning"}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton onClick={() => handleDownload(doc.file, doc.file_name)}>
                                        <Download />
                                    </IconButton>
                                    {!doc.is_verified && (
                                        <IconButton color="error">
                                            <Delete />
                                        </IconButton>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};
export default PortalVault;