import { ImageResponse } from 'next/og';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Icon generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse looks like HTML/CSS. This builds the Lucide QrCode shape.
      <div
        style={{
          fontSize: 24,
          background: '#3b82f6', // Bright Tailwind Blue background
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '20%', // Slightly rounded square icon
          color: 'white',
        }}
      >
        {/* Crisp vector representation of the Lucide QrCode icon */}
        <svg
          xmlns="http://w3.org"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="5" height="5" x="2" y="2" rx="1" />
          <rect width="5" height="5" x="17" y="2" rx="1" />
          <rect width="5" height="5" x="2" y="17" rx="1" />
          <path d="M17 17h.01" />
          <path d="M17 22h5" />
          <path d="M22 17v5" />
          <path d="M7 12h.01" />
          <path d="M12 7h.01" />
          <path d="M12 12h5" />
          <path d="M12 17h.01" />
          <path d="M17 12h5" />
        </svg>
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  );
}
