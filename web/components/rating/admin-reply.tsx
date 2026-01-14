'use client';

import { ShieldCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface AdminReplyProps {
  reply: {
    message: string;
    repliedAt: Date;
  };
}

export default function AdminReply({ reply }: AdminReplyProps) {
  return (
    <div className="mt-4 ml-12 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-emerald-900">Phản hồi từ Admin</span>
            <span className="text-xs text-emerald-600">
              {formatDistanceToNow(new Date(reply.repliedAt), { addSuffix: true, locale: vi })}
            </span>
          </div>
          <p className="text-sm text-emerald-800 leading-relaxed">{reply.message}</p>
        </div>
      </div>
    </div>
  );
}