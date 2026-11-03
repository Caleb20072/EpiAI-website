import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { ChatPage } from '@/components/chat/ChatPage';

export default function ChatRoutePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50dvh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted" />
        </div>
      }
    >
      <ChatPage />
    </Suspense>
  );
}
