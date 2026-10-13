/**
 * Headers on every response. HTTPS only, no MIME sniffing, a sensible referrer, no framing of this site by others,
 * and no camera, microphone or location. `payment` is left alone: Cal ID's Razorpay checkout runs in an iframe.
 * A full Content-Security-Policy is not set here: Cal ID's embed loads scripts from several hosts.
 */
export const SECURITY_HEADERS = [
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];
