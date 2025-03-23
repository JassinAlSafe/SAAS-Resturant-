'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

export default function CreateTestSubscriptionPage() {
  const [userId, setUserId] = useState('f110692f-0209-479e-8b13-7b496c5c24d8');
  const [businessProfileId, setBusinessProfileId] = useState('eabbcdcc-6685-45b8-99fe-9d29031cbb34');
  const [planName, setPlanName] = useState('Pro');
  const [priceId, setPriceId] = useState('price_XXXX');
  const [productId, setProductId] = useState('prod_RzCVIogVpsmUTr');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const createTestSubscription = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/testing/create-test-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          businessProfileId,
          planName,
          priceId,
          productId
        }),
      });

      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        toast({
          title: 'Success!',
          description: 'Test subscription created successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to create test subscription',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create Test Subscription</CardTitle>
          <CardDescription>
            This tool creates a test subscription for a user without going through Stripe.
            Use it for testing subscription features in development.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userId">User ID</Label>
            <Input 
              id="userId" 
              value={userId} 
              onChange={(e) => setUserId(e.target.value)} 
              placeholder="User ID"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="businessProfileId">Business Profile ID</Label>
            <Input 
              id="businessProfileId" 
              value={businessProfileId} 
              onChange={(e) => setBusinessProfileId(e.target.value)} 
              placeholder="Business Profile ID"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="planName">Plan Name</Label>
            <Input 
              id="planName" 
              value={planName} 
              onChange={(e) => setPlanName(e.target.value)} 
              placeholder="Plan Name (e.g., Pro, Enterprise)"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="priceId">Price ID</Label>
            <Input 
              id="priceId" 
              value={priceId} 
              onChange={(e) => setPriceId(e.target.value)} 
              placeholder="Stripe Price ID"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="productId">Product ID</Label>
            <Input 
              id="productId" 
              value={productId} 
              onChange={(e) => setProductId(e.target.value)} 
              placeholder="Stripe Product ID"
            />
          </div>
          
          {result && (
            <div className="mt-4 p-4 bg-gray-100 rounded-md">
              <h3 className="font-medium mb-2">Result:</h3>
              <pre className="text-xs overflow-auto">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={createTestSubscription} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Creating...' : 'Create Test Subscription'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
