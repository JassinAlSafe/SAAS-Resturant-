// Simple script to create a test subscription
async function createTestSubscription() {
  try {
    const response = await fetch('http://localhost:3001/api/testing/create-test-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'f110692f-0209-479e-8b13-7b496c5c24d8',
        businessProfileId: 'eabbcdcc-6685-45b8-99fe-9d29031cbb34',
        planName: 'Pro',
        priceId: 'price_XXXX', // Replace with your actual price ID if available
        productId: 'prod_RzCVIogVpsmUTr'
      }),
    });

    const data = await response.json();
    console.log('Response:', data);
    
    if (data.success) {
      console.log('✅ Test subscription created successfully!');
      console.log('Subscription ID:', data.subscription.id);
      console.log('Business Profile updated with plan:', data.profile.subscription_plan);
    } else {
      console.error('❌ Failed to create test subscription:', data.error);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createTestSubscription();
