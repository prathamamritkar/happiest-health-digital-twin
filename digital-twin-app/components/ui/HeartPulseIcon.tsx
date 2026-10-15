export default function HeartPulseIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 21C12 21 3 15.5 3 9.5C3 6.42 5.42 4 8.5 4C10.24 4 11.91 4.81 13 6.08C14.09 4.81 15.76 4 17.5 4C20.58 4 23 6.42 23 9.5"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
      <polyline
        points="1 12 5 12 7 8 9 16 11 12 13 12"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}
