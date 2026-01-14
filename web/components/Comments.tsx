'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

// Kiểu dữ liệu comment
export interface Comment {
  _id: string;
  user: {
    name: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
}

// Props truyền từ trang cha (ví dụ: tourId hoặc productId)
interface CommentsProps {
  entityType: 'TOUR' | 'PRODUCT';
  entityId: string;
  userId: string; // ID người dùng hiện tại
}

const Comments: React.FC<CommentsProps> = ({
  entityType,
  entityId,
  userId,
}) => {
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();

  // 📥 Fetch danh sách comment
  const { data: comments, isLoading } = useQuery<Comment[]>({
    queryKey: ['comments', entityType, entityId],
    queryFn: async () => {
      const res = await axios.get(`/api/comments/${entityType}/${entityId}`);
      return res.data.data; // backend trả về dạng { data: [...] }
    },
  });

  // 📤 Gửi bình luận mới
  const mutation = useMutation({
    mutationFn: async () => {
      await axios.post(`/api/comments/${entityType}/${entityId}`, {
        userId,
        content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['comments', entityType, entityId],
      });
      setContent('');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    mutation.mutate();
  };

  return (
    <div className="mt-8 w-full rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-900">
      <h3 className="mb-4 text-lg font-semibold">Bình luận</h3>

      {/* Danh sách comment */}
      {isLoading ? (
        <p>Đang tải bình luận...</p>
      ) : comments && comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map(c => (
            <div key={c._id} className="flex gap-3 border-b pb-2">
              <Image
                src={c.user.avatar || '/assets/default-avatar.png'}
                alt={c.user.name}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <p className="font-medium">{c.user.name}</p>
                <p className="text-gray-700 dark:text-gray-300">{c.content}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {new Date(c.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Chưa có bình luận nào.</p>
      )}

      {/* Form nhập comment */}
      <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
        <input
          type="text"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Nhập bình luận của bạn..."
          className="flex-1 rounded-lg border border-gray-300 bg-transparent p-2 text-sm outline-none focus:ring focus:ring-blue-300 dark:border-gray-700"
        />
        <button
          type="submit"
          disabled={mutation.isPending}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-70"
        >
          {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Gửi
        </button>
      </form>
    </div>
  );
};

export default Comments;
