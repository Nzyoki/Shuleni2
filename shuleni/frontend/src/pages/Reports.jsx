import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Reports = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedReport, setSelectedReport] = useState('');
    const [reportData, setReportData] = useState(null);
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        // TODO: Implement initial data fetching
        setLoading(false);
    }, []);

    const handleReportChange = (e) => {
        setSelectedReport(e.target.value);
        setReportData(null);
    };

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const generateReport = async () => {
        try {
            setLoading(true);
            // TODO: Implement report generation
            setLoading(false);
        } catch (err) {
            setError('Failed to generate report');
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            <div className="bg-white shadow-md rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-2">
                            Report Type
                        </label>
                        <select
                            id="reportType"
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={selectedReport}
                            onChange={handleReportChange}
                        >
                            <option value="">Select a report type</option>
                            <option value="attendance">Attendance Report</option>
                            <option value="performance">Performance Report</option>
                            <option value="enrollment">Enrollment Report</option>
                            <option value="financial">Financial Report</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                                Start Date
                            </label>
                            <input
                                type="date"
                                id="startDate"
                                name="startDate"
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                value={dateRange.startDate}
                                onChange={handleDateChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                                End Date
                            </label>
                            <input
                                type="date"
                                id="endDate"
                                name="endDate"
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                value={dateRange.endDate}
                                onChange={handleDateChange}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        onClick={generateReport}
                        disabled={!selectedReport || !dateRange.startDate || !dateRange.endDate}
                    >
                        Generate Report
                    </button>
                </div>

                {reportData && (
                    <div className="mt-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Results</h2>
                        <div className="bg-gray-50 rounded-lg p-4">
                            {/* TODO: Implement report data display */}
                            <p className="text-gray-500">Report data will be displayed here</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports; 