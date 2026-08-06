import geoip from 'geoip-lite';

export function lookupIp(ip: string | null) {
  if (!ip) return null;
  try {
    const cleaned = ip.split(',')[0].trim();
    const geo = geoip.lookup(cleaned);
    if (!geo) return null;
    return {
      country: geo.country || null,
      region: geo.region || null,
      city: geo.city || null,
      ll: geo.ll || null,
      metro: geo.metro || null,
      timezone: (geo as any).timezone || null,
    };
  } catch (e) {
    console.error('geoip lookup failed', e);
    return null;
  }
}
