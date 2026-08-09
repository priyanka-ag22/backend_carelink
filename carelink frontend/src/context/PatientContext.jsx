import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import patientService from '../services/patientService';

const PatientContext = createContext(null);

export const PatientProvider = ({ children }) => {
    const [patients, setPatients] = useState([]);
    const [lastRegistered, setLastRegistered] = useState(null);
    const [patientsLoading, setPatientsLoading] = useState(false);

    const fetchPatients = useCallback(async () => {
        setPatientsLoading(true);
        try {
            const data = await patientService.getAllPatients();
            setPatients(data);
        } catch {
            setPatients([]);
        } finally {
            setPatientsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    const addPatientToState = useCallback((patientData) => {
        setLastRegistered(patientData);
        setPatients((prev) => [patientData, ...prev.filter((p) => p.id !== patientData.id)]);
    }, []);

    const clearLastRegistered = useCallback(() => {
        setLastRegistered(null);
    }, []);

    return (
        <PatientContext.Provider
            value={{
                patients,
                lastRegistered,
                patientsLoading,
                addPatientToState,
                clearLastRegistered,
                refreshPatients: fetchPatients,
            }}
        >
            {children}
        </PatientContext.Provider>
    );
};

export const usePatients = () => {
    const ctx = useContext(PatientContext);
    if (!ctx) throw new Error('usePatients must be used within PatientProvider');
    return ctx;
};

export default PatientContext;
