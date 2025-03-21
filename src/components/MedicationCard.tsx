import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Medication } from '@/lib/AuthContext';
import { Check, Edit, Trash2, Clock, Calendar, Info, RefreshCw, MapPin, AlertCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import PharmacyFinderAdvanced from './PharmacyFinderAdvanced';

interface MedicationCardProps {
  medication: Medication;
  compact?: boolean;
  disabled?: boolean;
  onMarkAsTaken?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRefillStock?: (id: string, amount: number) => void;
}

const MedicationCard: React.FC<MedicationCardProps> = ({
  medication,
  compact = false,
  disabled = false,
  onMarkAsTaken,
  onEdit,
  onDelete,
  onRefillStock
}) => {
  const { id, name, dosage, frequency, time, startDate, endDate, instructions, color, taken, stock } = medication;
  const [refillAmount, setRefillAmount] = useState<number>(30);
  const [refillDialogOpen, setRefillDialogOpen] = useState<boolean>(false);
  const [pharmacyFinderOpen, setPharmacyFinderOpen] = useState<boolean>(false);
  
  // Debug output
  console.log(`MedicationCard: ${name}, Stock: ${stock}, Type: ${typeof stock}`);
  
  // Format time for display
  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return timeString;
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return dateString;
    }
  };
  
  // Determine stock status for styling
  const getStockStatus = () => {
    if (stock === undefined || stock === null) return 'unknown';
    if (stock <= 0) return 'empty';
    if (stock <= 5) return 'low';
    return 'normal';
  };
  
  const stockStatus = getStockStatus();
  const stockColor = {
    empty: 'text-red-600',
    low: 'text-amber-600',
    normal: 'text-green-600',
    unknown: 'text-gray-600'
  }[stockStatus];
  
  const handleRefill = () => {
    if (onRefillStock && refillAmount > 0) {
      onRefillStock(id, refillAmount);
      setRefillDialogOpen(false);
    }
  };
  
  // Check if stock is low (less than 5 pills)
  const isStockLow = typeof stock === 'number' && stock < 5 && stock > 0;
  
  // Check if out of stock
  const isOutOfStock = typeof stock === 'number' && stock === 0;
  
  // Refill Dialog Component
  const RefillDialog = () => (
    <Dialog open={refillDialogOpen} onOpenChange={setRefillDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Refill {name}</DialogTitle>
          <DialogDescription>
            Add more pills to your current stock.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="refill-amount" className="text-right">
              Current Stock:
            </label>
            <div className="col-span-3">
              <span className="font-medium">{stock || 0} pills</span>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="refill-amount" className="text-right">
              Add Pills:
            </label>
            <div className="col-span-3">
              <Input
                id="refill-amount"
                type="number"
                value={refillAmount}
                onChange={(e) => setRefillAmount(Number(e.target.value))}
                min={1}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="new-total" className="text-right">
              New Total:
            </label>
            <div className="col-span-3">
              <span className="font-medium">{(stock || 0) + refillAmount} pills</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setRefillDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleRefill}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refill Stock
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
  
  if (compact) {
    return (
      <Card className={`border-l-4 ${taken ? 'border-l-green-500' : 'border-l-blue-500'} shadow-sm`}>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium text-base">{name}</h3>
              <p className="text-sm text-muted-foreground">{dosage}</p>
              {stock !== undefined && (
                <p className={`text-xs font-medium ${stockColor}`}>
                  <strong>{stock <= 0 ? 'Out of stock' : `${stock} pills remaining`}</strong>
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-sm text-muted-foreground flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {formatTime(time)}
              </div>
              {onMarkAsTaken && !taken && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8 w-8 p-0" 
                  onClick={() => onMarkAsTaken(id)}
                  disabled={disabled}
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
              {taken && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Taken
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card className={`overflow-hidden transition-all ${taken ? 'bg-gray-50 border-gray-200' : ''} ${compact ? 'h-full' : ''}`}>
        <CardContent className={`${compact ? 'p-3' : 'p-5'}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div 
                className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0`}
                style={{ backgroundColor: `var(--${color || 'blue'}-500)` }}
              />
              <div>
                <h3 className={`font-medium ${taken ? 'text-gray-500 line-through' : ''} ${compact ? 'text-sm' : 'text-base'}`}>
                  {name}
                </h3>
                <p className={`text-gray-500 ${compact ? 'text-xs' : 'text-sm'}`}>
                  {dosage} • {frequency}
                </p>
                
                {!compact && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime(time)}
                    </div>
                    
                    {instructions && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center text-xs text-gray-500 cursor-help">
                              <Info className="h-3 w-3 mr-1" />
                              Instructions
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{instructions}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    
                    {typeof stock === 'number' && (
                      <div className={`flex items-center text-xs ${isOutOfStock ? 'text-red-500' : isStockLow ? 'text-amber-500' : 'text-gray-500'}`}>
                        <RefreshCw className="h-3 w-3 mr-1" />
                        {isOutOfStock ? (
                          'Out of stock'
                        ) : (
                          `${stock} pill${stock !== 1 ? 's' : ''} left`
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {!compact && !disabled && (
              <div className="flex space-x-1">
                {onEdit && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={() => onEdit(id)}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                )}
                
                {onDelete && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" 
                    onClick={() => onDelete(id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                )}
              </div>
            )}
          </div>
          
          {isOutOfStock && !compact && (
            <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded-md flex items-center text-sm text-red-700">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>You're out of {name}. Find a pharmacy to refill your prescription.</span>
            </div>
          )}
          
          {isStockLow && !compact && (
            <div className="mt-3 p-2 bg-amber-50 border border-amber-100 rounded-md flex items-center text-sm text-amber-700">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>Your {name} stock is running low. Consider refilling soon.</span>
            </div>
          )}
        </CardContent>
        
        {!compact && !disabled && (
          <CardFooter className="px-5 py-3 bg-gray-50 flex flex-wrap gap-2">
            {onMarkAsTaken && (
              <Button 
                variant={taken ? "outline" : "default"} 
                size="sm" 
                className={taken ? "border-green-200 text-green-700 bg-green-50 hover:bg-green-100" : ""}
                onClick={() => onMarkAsTaken(id)}
                disabled={disabled}
              >
                <Check className="h-4 w-4 mr-2" />
                {taken ? "Taken" : "Mark as Taken"}
              </Button>
            )}
            
            {onRefillStock && typeof stock === 'number' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setRefillDialogOpen(true)}
                disabled={disabled}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refill
              </Button>
            )}
            
            {(isOutOfStock || isStockLow) && (
              <Button 
                variant={isOutOfStock ? "destructive" : "outline"} 
                size="sm"
                onClick={() => setPharmacyFinderOpen(true)}
                className={isStockLow && !isOutOfStock ? "border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100" : ""}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Find Nearby Pharmacies
              </Button>
            )}
          </CardFooter>
        )}
      </Card>
      
      {RefillDialog()}
      
      <Dialog open={pharmacyFinderOpen} onOpenChange={setPharmacyFinderOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <PharmacyFinderAdvanced 
            medicationName={name} 
            onClose={() => setPharmacyFinderOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MedicationCard;
