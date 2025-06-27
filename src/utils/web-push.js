const PUBLIC_VAPID_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';
const API_BASE_URL = 'https://story-api.dicoding.dev/v1';

async function subscribePushNotification(authToken) {
    if (!('serviceWorker' in navigator)) {
        console.warn('Service Worker not supported!');
        return;
    }

    try {
        const reg = await navigator.serviceWorker.ready;

        const subscription = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
        });

        const body = JSON.stringify({
            endpoint: subscription.endpoint,
            keys: {
                p256dh: subscription.getKey('p256dh') ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')))) : '',
                auth: subscription.getKey('auth') ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')))) : '',
            },
        });

    const res = await fetch(`${API_BASE_URL}/notifications/subscribe`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
        },
        body,
    });

    const result = await res.json();
        if (!res.ok || result.error) {
            throw new Error(result.message || 'Failed to subscribe');
        }

        console.log('Subscribed to push notification 🎉');
        }   catch (err) {
            console.error('Push subscription error:', err);
        }
    }

// Utility: VAPID Key format converter
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

export { subscribePushNotification };
