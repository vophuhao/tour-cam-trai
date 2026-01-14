'use client';

import dynamic from 'next/dynamic';

// Import Chatbot dynamically with ssr: false to avoid Math.random() SSR issue in Next.js 16
const Chatbot = dynamic(
  () => import('@/components/chatbot').then(mod => ({ default: mod.Chatbot })),
  {
    ssr: false,
  },
);

export default function ChatbotWrapper() {
  return <Chatbot />;
}
