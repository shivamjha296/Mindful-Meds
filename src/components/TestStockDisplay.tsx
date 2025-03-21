import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Medication } from '@/lib/AuthContext';
import MedicationCard from './MedicationCard';

const TestStockDisplay: React.FC = () => {
  // Create test medications with different stock levels
  const testMedications: Medication[] = [
    {
      id: 'test-1',
      name: 'Test Medication 1',
      dosage: '10mg',
      frequency: 'Once daily',
      time: '08:00',
      startDate: new Date().toISOString(),
      createdAt: new Date(),
      stock: 0 // Out of stock
    },
    {
      id: 'test-2',
      name: 'Test Medication 2',
      dosage: '20mg',
      frequency: 'Twice daily',
      time: '12:00',
      startDate: new Date().toISOString(),
      createdAt: new Date(),
      stock: 3 // Low stock
    },
    {
      id: 'test-3',
      name: 'Test Medication 3',
      dosage: '30mg',
      frequency: 'Three times daily',
      time: '18:00',
      startDate: new Date().toISOString(),
      createdAt: new Date(),
      stock: 30 // Normal stock
    },
    {
      id: 'test-4',
      name: 'Test Medication 4',
      dosage: '40mg',
      frequency: 'As needed',
      time: '20:00',
      startDate: new Date().toISOString(),
      createdAt: new Date()
      // No stock property - should show as unknown
    }
  ];

  // Mock handlers
  const handleMarkAsTaken = (id: string) => console.log('Marked as taken:', id);
  const handleEdit = (id: string) => console.log('Edit:', id);
  const handleDelete = (id: string) => console.log('Delete:', id);
  const handleRefill = (id: string, amount: number) => console.log('Refill:', id, 'Amount:', amount);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Stock Display Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {testMedications.map(medication => (
          <MedicationCard
            key={medication.id}
            medication={medication}
            onMarkAsTaken={handleMarkAsTaken}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRefillStock={handleRefill}
          />
        ))}
      </div>
      
      <h2 className="text-xl font-bold mb-4">Compact View</h2>
      <div className="space-y-4">
        {testMedications.map(medication => (
          <MedicationCard
            key={medication.id}
            medication={medication}
            compact={true}
            onMarkAsTaken={handleMarkAsTaken}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRefillStock={handleRefill}
          />
        ))}
      </div>
    </div>
  );
};

export default TestStockDisplay; 