import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/lib/AuthContext';

export function TestForm() {
  const { currentUser, userProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [showDebug, setShowDebug] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name} = ${value}`);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    alert(`Form submitted with: ${JSON.stringify(formData)}`);
  };
  
  const toggleDebug = () => {
    setShowDebug(!showDebug);
    console.log('Current User:', currentUser);
    console.log('User Profile:', userProfile);
  };
  
  return (
    <div className="p-6 border rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Test Form</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Name
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            />
          </label>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            />
          </label>
        </div>
        
        <div className="flex space-x-2">
          <Button type="submit">Submit</Button>
          <Button type="button" variant="outline" onClick={toggleDebug}>
            {showDebug ? "Hide Debug" : "Show Debug"}
          </Button>
        </div>
      </form>
      
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h3 className="font-medium">Current Form Data:</h3>
        <pre>{JSON.stringify(formData, null, 2)}</pre>
      </div>
      
      {showDebug && (
        <div className="mt-4 p-4 bg-gray-100 rounded border border-blue-300">
          <h3 className="font-medium mb-2">Auth Debug Information:</h3>
          <div className="space-y-2">
            <div>
              <h4 className="font-medium">Current User:</h4>
              <pre className="text-xs overflow-auto max-h-40">
                {currentUser ? JSON.stringify(currentUser, null, 2) : "No current user"}
              </pre>
            </div>
            <div>
              <h4 className="font-medium">User Profile:</h4>
              <pre className="text-xs overflow-auto max-h-40">
                {userProfile ? JSON.stringify(userProfile, null, 2) : "No user profile"}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 