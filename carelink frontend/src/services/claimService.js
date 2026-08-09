import api from './api';

export const claimService = {
    submitClaim: async (claimData) => {
        const response = await api.post('/api/v1/claims', {
            patientId:       claimData.patientId,
            diagnosisCode:   claimData.diagnosisCode,
            requestedAmount: claimData.requestedAmount,
        });
        return {
            success: true,
            message: `Claim submitted successfully.`,
            data: response.data,
        };
    },

    getDashboardMetrics: () =>
        new Promise((resolve) =>
            setTimeout(() =>
                resolve({
                    totalPatients:    '12,450',
                    activeClaims:     '432',
                    pendingApprovals: '18',
                    revenue:          '₹12.5L',
                }),
            600)
        ),

    getRecentActivity: () =>
        new Promise((resolve) =>
            setTimeout(() =>
                resolve([
                    { id: 'ACT-901', patientName: 'Aarav Sharma',  action: 'Inpatient Admission & Ayushman Bharat Claim',   date: '08/08/2026', status: 'Completed' },
                    { id: 'ACT-902', patientName: 'Rajesh Gupta',  action: 'Cardiology TPA Pre-Auth Verification',          date: '08/08/2026', status: 'Pending'   },
                    { id: 'ACT-903', patientName: 'Priya Patel',   action: 'OPD Consultation Cashless Claim',               date: '07/08/2026', status: 'Completed' },
                    { id: 'ACT-904', patientName: 'Ananya Verma',  action: 'Orthopaedic Surgery PM-JAY Coverage Claim',     date: '07/08/2026', status: 'Rejected'  },
                    { id: 'ACT-905', patientName: 'Vikram Nair',   action: 'Lab Diagnostic Insurance Pre-Auth',             date: '06/08/2026', status: 'Completed' },
                    { id: 'ACT-906', patientName: 'Meera Iyer',    action: 'Emergency ER Cashless Claim Clearance',         date: '05/08/2026', status: 'Pending'   },
                ]),
            800)
        ),
};

export default claimService;
