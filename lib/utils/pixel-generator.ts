export function generateTrackingPixel(appUrl: string): string {
  return `<!-- Referral Tracking Pixel (Page Views) -->
<script>
(function() {
  // Try to get ref from multiple sources
  function getRefCode() {
    // 1. Check URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const urlRef = urlParams.get('ref');
    if (urlRef) return urlRef;

    // 2. Check cookie
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'referral_code') return value;
    }

    return null;
  }

  const refCode = getRefCode();

  if (refCode) {
    // Track page view
    fetch('${appUrl}/api/track-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ref_code: refCode,
        page_url: window.location.href
      })
    }).catch(function(err) {
      console.error('Tracking error:', err);
    });
  }
})();
</script>`
}

export function generateConversionPixel(appUrl: string): string {
  return `<!-- Referral Conversion Pixel -->
<script>
(function() {
  // Helper: Get ref code from multiple sources
  function getRefCode() {
    // 1. Check URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const urlRef = urlParams.get('ref');
    if (urlRef) return urlRef;

    // 2. Check cookie
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'referral_code') return value;
    }

    return null;
  }

  // Helper: Get conversion data from multiple sources
  function getConversionData() {
    const data = { ref_code: getRefCode() };
    if (!data.ref_code) return null;

    // Try to get order data from different sources

    // 1. Check if user called window.trackReferralConversion()
    if (window.referralConversionData) {
      return { ...data, ...window.referralConversionData };
    }

    // 2. Check data layer (Google Tag Manager style)
    if (window.dataLayer) {
      for (let i = window.dataLayer.length - 1; i >= 0; i--) {
        const event = window.dataLayer[i];
        if (event.event === 'referral_conversion' || event.event === 'purchase') {
          return {
            ...data,
            order_id: event.order_id || event.transactionId,
            amount: event.amount || event.transactionTotal || event.value,
            buyer_email: event.buyer_email || event.email || event.customerEmail
          };
        }
      }
    }

    // 3. Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order_id');
    const amount = urlParams.get('amount');
    const email = urlParams.get('email');

    if (orderId || amount || email) {
      return {
        ...data,
        order_id: orderId,
        amount: amount ? parseFloat(amount) : null,
        buyer_email: email
      };
    }

    // 4. Check data attributes
    const conversionEl = document.getElementById('conversion-data');
    if (conversionEl) {
      return {
        ...data,
        order_id: conversionEl.dataset.orderId,
        amount: conversionEl.dataset.amount ? parseFloat(conversionEl.dataset.amount) : null,
        buyer_email: conversionEl.dataset.email
      };
    }

    // Return just ref code (basic tracking)
    return data;
  }

  // Execute tracking
  const conversionData = getConversionData();

  if (conversionData && conversionData.ref_code) {
    fetch('${appUrl}/api/conversion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(conversionData)
    }).catch(function(err) {
      console.error('Conversion tracking error:', err);
    });
  }
})();
</script>

<!-- Optional: Function API for manual tracking -->
<script>
window.trackReferralConversion = function(data) {
  window.referralConversionData = data;
};
</script>`
}

export function generateConversionExamples(): {
  urlParams: string
  functionCall: string
  dataLayer: string
  dataAttributes: string
} {
  return {
    urlParams: `<!-- Method 1: URL Parameters (Simplest) -->
Redirect to confirmation page with parameters:
/confirmation?ref=ABC123&order_id=12345&amount=75&email=john@email.com

Then paste the conversion pixel on that page.`,

    functionCall: `<!-- Method 2: Function Call (Recommended) -->
<!-- Paste conversion pixel first -->

<!-- Then call this function with your order data -->
<script>
trackReferralConversion({
  order_id: '12345',
  amount: 75.00,
  buyer_email: 'john@example.com'
});
</script>`,

    dataLayer: `<!-- Method 3: Data Layer (Google Tag Manager) -->
<!-- For users already using GTM -->
<script>
window.dataLayer = window.dataLayer || [];
dataLayer.push({
  'event': 'referral_conversion',
  'order_id': '12345',
  'amount': 75.00,
  'buyer_email': 'john@example.com'
});
</script>

<!-- Then paste conversion pixel -->`,

    dataAttributes: `<!-- Method 4: Data Attributes -->
<!-- Add this div with your order data -->
<div id="conversion-data"
     data-order-id="12345"
     data-amount="75.00"
     data-email="john@example.com"
     style="display:none;">
</div>

<!-- Then paste conversion pixel -->`
  }
}
