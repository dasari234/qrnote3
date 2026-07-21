import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseUserAgent(ua: string) {
  const browser =
    /Edg\/|Edge\/|EdgA\/|EdgiOS/.test(ua) ? 'Edge'
      : /OPR\/|Opera/.test(ua) ? 'Opera'
        : /Chrome\/|CriOS/.test(ua) ? 'Chrome'
          : /Firefox\/|FxiOS/.test(ua) ? 'Firefox'
            : /Safari\//.test(ua) ? 'Safari'
              : 'Unknown';

  const os =
    /Windows NT 10/.test(ua) ? 'Windows'
      : /Mac OS X|Macintosh/.test(ua) ? 'macOS'
        : /iPhone|iPad|iPod/.test(ua) ? 'iOS'
          : /Android/.test(ua) ? 'Android'
            : /Linux/.test(ua) ? 'Linux'
              : 'Unknown';

  const device = /iPad/.test(ua) ? 'iPad'
    : /iPhone/.test(ua) ? 'iPhone'
      : /Android/.test(ua) ? 'Android'
        : /Mobile/.test(ua) ? 'Mobile'
          : 'Desktop';

  return { browser, os, device };
}
