import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    CircularProgress,
    Alert
} from '@mui/material';
import { submitAssessment } from '../services/assessments';

const AssessmentSubmission = ({ open, onClose, assessment, onSubmitSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [submission, setSubmission] = useState('');

    const handleSubmit = async () => {
        if (!assessment) {
            setError('No assessment selected');
            return;
        }

        if (!submission.trim()) {
            setError('Please enter your answer before submitting');
            return;
        }

        setLoading(true);
        try {
            await submitAssessment(assessment.id, { submission });
            setLoading(false);
            setSubmission('');
            if (onSubmitSuccess) {
                onSubmitSuccess();
            }
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to submit assessment');
            setLoading(false);
        }
    };

    if (!assessment) {
        return null;
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Submit Answer: {assessment.title}</DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <div style={{ marginBottom: '16px', marginTop: '8px' }}>
                    <strong>Description:</strong> {assessment.description}
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <strong>Type:</strong> {assessment.type}
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <strong>Total Points:</strong> {assessment.total_points}
                </div>

                {assessment.due_date && (
                    <div style={{ marginBottom: '16px' }}>
                        <strong>Due Date:</strong> {new Date(assessment.due_date).toLocaleDateString()}
                    </div>
                )}

                <TextField
                    label="Your Answer"
                    multiline
                    rows={8}
                    fullWidth
                    variant="outlined"
                    value={submission}
                    onChange={(e) => setSubmission(e.target.value)}
                    placeholder="Type your answer here..."
                    disabled={loading}
                    sx={{ mt: 2 }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    color="primary"
                    variant="contained"
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} /> : 'Submit'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AssessmentSubmission; 