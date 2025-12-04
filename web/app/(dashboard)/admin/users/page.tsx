/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { Search, Filter, UserPlus, MoreVertical, Edit, Trash2, Ban, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555';

interface User {
  _id: string;
  email: string;
  username: string;
  role: string;
  avatarUrl?: string;
  phoneNumber?: string;
  bio?: string;
  isVerified: boolean;
  provider: string;
  createdAt: string;
  updatedAt: string;
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, roleFilter, verifiedFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API}/users`, {
        credentials: 'include',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(data.data || []);
      }
    } catch (err) {
      console.error('Load users error:', err);
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.username.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          u.phoneNumber?.toLowerCase().includes(query)
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    // Verified filter
    if (verifiedFilter !== 'all') {
      filtered = filtered.filter((u) =>
        verifiedFilter === 'verified' ? u.isVerified : !u.isVerified
      );
    }

    setFilteredUsers(filtered);
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API}/users/${userId}/role`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        toast.success('Cập nhật vai trò thành công');
        loadUsers();
        setShowEditModal(false);
      } else {
        toast.error('Cập nhật vai trò thất bại');
      }
    } catch (err) {
      console.error('Update role error:', err);
      toast.error('Đã có lỗi xảy ra');
    }
  };

  const handleToggleVerified = async (userId: string, isVerified: boolean) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API}/users/${userId}/verify`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isVerified: !isVerified }),
      });

      if (res.ok) {
        toast.success(`${!isVerified ? 'Đã xác thực' : 'Đã bỏ xác thực'} người dùng`);
        loadUsers();
      } else {
        toast.error('Cập nhật trạng thái thất bại');
      }
    } catch (err) {
      console.error('Toggle verified error:', err);
      toast.error('Đã có lỗi xảy ra');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API}/users/${selectedUser._id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success('Xóa người dùng thành công');
        loadUsers();
        setShowDeleteModal(false);
        setSelectedUser(null);
      } else {
        toast.error('Xóa người dùng thất bại');
      }
    } catch (err) {
      console.error('Delete user error:', err);
      toast.error('Đã có lỗi xảy ra');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-purple-100 text-purple-700';
      case 'host':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleText = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'Quản trị viên';
      case 'host':
        return 'Chủ nhà';
      default:
        return 'Người dùng';
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }
  console.log('Filtered Users:', filteredUsers);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p className="mt-1 text-sm text-gray-600">
            Tổng số: {filteredUsers.length} người dùng
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search */}
          <div className="relative flex-1 md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên, email, số điện thoại..."
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            Bộ lọc
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 grid gap-4 border-t border-gray-200 pt-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Vai trò
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">Tất cả</option>
                <option value="user">Người dùng</option>
                <option value="host">Chủ nhà</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Trạng thái
              </label>
              <select
                value={verifiedFilter}
                onChange={(e) => setVerifiedFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">Tất cả</option>
                <option value="verified">Đã xác thực</option>
                <option value="unverified">Chưa xác thực</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    Không tìm thấy người dùng nào
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.username}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{user.username}</div>
                          {user.phoneNumber && (
                            <div className="text-xs text-gray-500">{user.phoneNumber}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{user.email}</div>
                     
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getRoleBadge(
                          user.role
                        )}`}
                      >
                        {getRoleText(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-sm text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          Đã xác thực
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                          <Ban className="h-4 w-4" />
                          Chưa xác thực
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowEditModal(true);
                          }}
                          className="rounded p-1 text-blue-600 hover:bg-blue-50"
                          title="Chỉnh sửa"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleVerified(user._id, user.isVerified)}
                          className="rounded p-1 text-green-600 hover:bg-green-50"
                          title={user.isVerified ? 'Bỏ xác thực' : 'Xác thực'}
                        >
                          {user.isVerified ? (
                            <Ban className="h-4 w-4" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteModal(true);
                          }}
                          className="rounded p-1 text-red-600 hover:bg-red-50"
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Role Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Thay đổi vai trò
            </h3>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Người dùng: {selectedUser.username}
              </label>
              <select
                defaultValue={selectedUser.role}
                onChange={(e) => handleUpdateRole(selectedUser._id, e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="user">Người dùng</option>
                <option value="host">Chủ nhà</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Xác nhận xóa</h3>
            <p className="mb-6 text-sm text-gray-600">
              Bạn có chắc chắn muốn xóa người dùng{' '}
              <span className="font-medium">{selectedUser.username}</span>? Hành động này
              không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteUser}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}