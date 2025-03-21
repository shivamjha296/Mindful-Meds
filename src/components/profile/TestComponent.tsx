import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TestComponent() {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is a test card to check if JSX is working properly.</p>
        </CardContent>
      </Card>
    </div>
  );
} 