import { useState, useEffect, useRef, useCallback } from 'react';
import { contactAPI } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import {
  FaEnvelope,
  FaEnvelopeOpen,
  FaTrash,
  FaSearch,
  FaCircle,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaInbox,
  FaFilter,
  FaPaperPlane,
  FaChevronLeft,
  FaChevronRight,
  FaSync,
  FaUser,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFileAlt,
  FaImage,
  FaDownload,
  FaPaperclip,
} from 'react-icons/fa';

interface Attachment {
  filename: string;
  storedName: string;
  mimetype: string;
  size: number;
  url: string;
}

interface Reply {
  _id: string;
  content: string;
  sentAt: string;
  emailMessageId?: string;
  sender: 'user' | 'admin'; // user = reply from their email inbox, admin = sent from dashboard
  attachments: Attachment[];
}

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  attachments: Attachment[]; // files on the initial message
  read: boolean;
  status: 'pending' | 'replied' | 'closed';
  threadId: string;
  replies: Reply[];
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  total: number;
  unread: number;
  pending: number;
  replied: number;
  closed: number;
}

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  replied: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  closed: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

const STATUS_ICONS = {
  pending: <FaCircle className="w-3 h-3 text-yellow-500" />,
  replied: <FaCheckCircle className="w-3 h-3 text-green-500" />,
  closed: <FaTimesCircle className="w-3 h-3 text-gray-400" />,
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function attachmentIcon(mime: string) {
  if (mime.startsWith('image/')) return <FaImage className="w-3.5 h-3.5 text-violet-400" />;
  if (mime === 'application/pdf') return <FaFilePdf className="w-3.5 h-3.5 text-red-400" />;
  if (mime.includes('word')) return <FaFileWord className="w-3.5 h-3.5 text-blue-400" />;
  if (mime.includes('excel') || mime.includes('spreadsheet'))
    return <FaFileExcel className="w-3.5 h-3.5 text-green-400" />;
  return <FaFileAlt className="w-3.5 h-3.5 text-gray-400" />;
}

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(
  /\/api$/,
  ''
);

function AttachmentList({ attachments }: { attachments: Attachment[] }) {
  if (!attachments || attachments.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {attachments.map((a, i) => (
        <a
          key={i}
          href={`${API_BASE}${a.url}`}
          target="_blank"
          rel="noopener noreferrer"
          download={a.filename}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 text-xs text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors shadow-sm"
          title={`Download ${a.filename}`}
        >
          {attachmentIcon(a.mimetype)}
          <span className="max-w-[120px] truncate">{a.filename}</span>
          <span className="text-gray-400 flex-shrink-0">{formatBytes(a.size)}</span>
          <FaDownload className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
        </a>
      ))}
    </div>
  );
}

function getLatestMessagePreview(msg: ContactMessage) {
  if (msg.replies && msg.replies.length > 0) {
    const lastReply = msg.replies[msg.replies.length - 1];
    const prefix = lastReply.sender === 'admin' ? 'You: ' : '';
    return `${prefix}${lastReply.content === '__NO_BODY__' ? 'Replied via email' : lastReply.content}`;
  }
  return msg.message;
}

const ContactManager = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'replied' | 'closed'>('all');
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'unread-first' | 'name-az'>('newest');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [replyAttachments, setReplyAttachments] = useState<File[]>([]);
  const [replyAttachmentErrors, setReplyAttachmentErrors] = useState<string[]>([]);
  const replyFileInputRef = useRef<HTMLInputElement>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sidebarWidth, setSidebarWidth] = useState(340);
  const [isResizing, setIsResizing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const { showFromResponse, showError } = useToast();
  const replyRef = useRef<HTMLTextAreaElement>(null);

  const MAX_FILES = 5;
  const MAX_SIZE_MB = 10;
  const ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
  ];

  const addReplyFiles = useCallback((incoming: File[]) => {
    const errs: string[] = [];
    const valid: File[] = [];

    for (const f of incoming) {
      if (!ALLOWED_TYPES.includes(f.type)) {
        errs.push(`"${f.name}" is not an allowed file type.`);
        continue;
      }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        errs.push(`"${f.name}" exceeds ${MAX_SIZE_MB} MB limit.`);
        continue;
      }
      valid.push(f);
    }

    setReplyAttachments((prev) => {
      const merged = [...prev, ...valid];
      if (merged.length > MAX_FILES) {
        errs.push(`Maximum ${MAX_FILES} files allowed. Extra files ignored.`);
        return merged.slice(0, MAX_FILES);
      }
      return merged;
    });

    setReplyAttachmentErrors(errs);
  }, []);

  const removeReplyAttachment = (idx: number) => {
    setReplyAttachments((prev) => prev.filter((_, i) => i !== idx));
    setReplyAttachmentErrors([]);
  };

  const handleReplyFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addReplyFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Reset page to 1 when filters or search query change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, readFilter, sortBy]);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = document.getElementById('contact-manager-container');
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const newWidth = e.clientX - containerRect.left;
        if (newWidth >= 260 && newWidth <= 500) {
          setSidebarWidth(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleRefreshAll = useCallback(
    async (isBackground = false) => {
      if (refreshing) return;
      if (!isBackground) setRefreshing(true);
      try {
        const [msgsRes, statsRes] = await Promise.all([contactAPI.getAll(), contactAPI.getStats()]);
        setMessages(msgsRes.data.data);
        setStats(statsRes.data.data);

        // Also refresh the selected message replies if one is open
        if (selectedMessage) {
          try {
            const res = await contactAPI.getReplies(selectedMessage._id);
            const { replies, status } = res.data.data;
            setSelectedMessage((prev) =>
              prev?._id === selectedMessage._id ? { ...prev, replies, status } : prev
            );
          } catch {
            // silent background poll error
          }
        }
      } catch (error) {
        if (!isBackground) showError(error);
      } finally {
        if (!isBackground) setRefreshing(false);
      }
    },
    [selectedMessage, refreshing]
  );

  // Auto-refresh the entire inbox (list + active thread + stats) every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefreshAll(true);
    }, 30_000);

    return () => clearInterval(interval);
  }, [handleRefreshAll]);

  const fetchAll = async () => {
    try {
      const [msgsRes, statsRes] = await Promise.all([contactAPI.getAll(), contactAPI.getStats()]);
      setMessages(msgsRes.data.data);
      setStats(statsRes.data.data);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMessage = async (msg: ContactMessage) => {
    if (selectedMessage?._id === msg._id) return;
    setLoadingMessage(true);
    setReplyContent('');
    setReplyAttachments([]);
    setReplyAttachmentErrors([]);
    try {
      const res = await contactAPI.getById(msg._id);
      const full: ContactMessage = res.data.data;
      setSelectedMessage(full);
      // Update read state in local list
      setMessages((prev) => prev.map((m) => (m._id === msg._id ? { ...m, read: true } : m)));
      if (stats && !msg.read) {
        setStats((s) => (s ? { ...s, unread: Math.max(0, s.unread - 1) } : s));
      }
    } catch (error) {
      showError(error);
    } finally {
      setLoadingMessage(false);
    }
  };

  const handleReply = async () => {
    if (!selectedMessage || !replyContent.trim()) return;
    setSendingReply(true);
    try {
      const res = await contactAPI.reply(
        selectedMessage._id,
        replyContent.trim(),
        replyAttachments
      );
      showFromResponse(res);
      const updated: ContactMessage = res.data.data;
      setSelectedMessage(updated);
      setMessages((prev) =>
        prev.map((m) => (m._id === updated._id ? { ...m, status: updated.status } : m))
      );
      setStats((s) =>
        s ? { ...s, pending: Math.max(0, s.pending - 1), replied: s.replied + 1 } : s
      );
      setReplyContent('');
      setReplyAttachments([]);
      setReplyAttachmentErrors([]);
    } catch (error) {
      showError(error);
    } finally {
      setSendingReply(false);
    }
  };

  const handleStatusChange = async (status: 'pending' | 'replied' | 'closed') => {
    if (!selectedMessage || updatingStatus) return;
    setUpdatingStatus(true);
    try {
      const res = await contactAPI.updateStatus(selectedMessage._id, status);
      showFromResponse(res);
      const updated: ContactMessage = res.data.data;
      setSelectedMessage(updated);
      setMessages((prev) =>
        prev.map((m) => (m._id === updated._id ? { ...m, status: updated.status } : m))
      );
    } catch (error) {
      showError(error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMessage) return;
    setDeletingId(selectedMessage._id);
    try {
      const res = await contactAPI.delete(selectedMessage._id);
      showFromResponse(res);
      setMessages((prev) => prev.filter((m) => m._id !== selectedMessage._id));
      setSelectedMessage(null);
      setShowDeleteConfirm(false);
      fetchAll(); // refresh stats
    } catch (error) {
      showError(error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleBulkMarkAsRead = async () => {
    if (selectedIds.length === 0) return;
    try {
      const res = await contactAPI.bulkMarkAsRead(selectedIds, true);
      showFromResponse(res);
      setMessages((prev) =>
        prev.map((m) => (selectedIds.includes(m._id) ? { ...m, read: true } : m))
      );
      setStats((s) => {
        if (!s) return s;
        const newlyRead = messages.filter((m) => selectedIds.includes(m._id) && !m.read).length;
        return { ...s, unread: Math.max(0, s.unread - newlyRead) };
      });
      setSelectedIds([]);
    } catch (error) {
      showError(error);
    }
  };

  const handleBulkMarkAsUnread = async () => {
    if (selectedIds.length === 0) return;
    try {
      const res = await contactAPI.bulkMarkAsRead(selectedIds, false);
      showFromResponse(res);
      setMessages((prev) =>
        prev.map((m) => (selectedIds.includes(m._id) ? { ...m, read: false } : m))
      );
      setStats((s) => {
        if (!s) return s;
        const newlyUnread = messages.filter((m) => selectedIds.includes(m._id) && m.read).length;
        return { ...s, unread: s.unread + newlyUnread };
      });
      setSelectedIds([]);
    } catch (error) {
      showError(error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (
      !window.confirm(
        `Are you sure you want to delete the ${selectedIds.length} selected message(s)?`
      )
    )
      return;
    try {
      const res = await contactAPI.bulkDelete(selectedIds);
      showFromResponse(res);
      setMessages((prev) => prev.filter((m) => !selectedIds.includes(m._id)));
      if (selectedMessage && selectedIds.includes(selectedMessage._id)) {
        setSelectedMessage(null);
      }
      setSelectedIds([]);
      fetchAll(); // refresh stats
    } catch (error) {
      showError(error);
    }
  };

  // Filtered + sorted messages
  const filtered = messages
    .filter((m) => {
      const matchesSearch =
        !searchQuery ||
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.subject.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
      const matchesRead =
        readFilter === 'all' ||
        (readFilter === 'unread' && !m.read) ||
        (readFilter === 'read' && m.read);
      return matchesSearch && matchesStatus && matchesRead;
    })
    .sort((a, b) => {
      if (sortBy === 'newest')
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest')
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'unread-first') {
        if (a.read === b.read)
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return a.read ? 1 : -1;
      }
      if (sortBy === 'name-az') return a.name.localeCompare(b.name);
      return 0;
    });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filtered.length);
  const paginatedFiltered = filtered.slice(startIndex, endIndex);

  const rangeText =
    filtered.length > 0 ? `${startIndex + 1}–${endIndex} of ${filtered.length}` : '0 of 0';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin w-8 h-8 text-primary-500" />
      </div>
    );
  }

  return (
    <div
      id="contact-manager-container"
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col ${isResizing ? 'select-none cursor-col-resize' : ''}`}
      style={{ height: 'calc(100vh - 260px)', minHeight: '500px' }}
    >
      {/* Header + Stats Bar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-3">
          <FaInbox className="text-primary-500 w-5 h-5" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Contact Messages</h2>
          {stats && stats.unread > 0 && (
            <span className="bg-primary-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {stats.unread} unread
            </span>
          )}
        </div>
        {stats && (
          <div className="hidden md:flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              {STATUS_ICONS.pending} {stats.pending} pending
            </span>
            <span className="flex items-center gap-1">
              {STATUS_ICONS.replied} {stats.replied} replied
            </span>
            <span className="flex items-center gap-1">
              {STATUS_ICONS.closed} {stats.closed} closed
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ─── Left Sidebar: Message List ─────────────────────────────────── */}
        <div
          className={`flex-shrink-0 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden ${
            sidebarCollapsed ? 'w-12 transition-all duration-300' : ''
          }`}
          style={{ width: sidebarCollapsed ? '48px' : `${sidebarWidth}px` }}
        >
          {/* Sidebar Header with collapse toggle */}
          <div
            className={`flex items-center border-b border-gray-200 dark:border-gray-700 flex-shrink-0 ${sidebarCollapsed ? 'justify-center p-2' : 'justify-between px-3 py-2'}`}
          >
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2 flex-1 mr-2">
                <input
                  type="checkbox"
                  checked={
                    paginatedFiltered.length > 0 &&
                    paginatedFiltered.every((msg) => selectedIds.includes(msg._id))
                  }
                  ref={(el) => {
                    if (el) {
                      const currentPageIds = paginatedFiltered.map((m) => m._id);
                      const isAllSelected =
                        currentPageIds.length > 0 &&
                        currentPageIds.every((id) => selectedIds.includes(id));
                      const isSomeSelected =
                        currentPageIds.length > 0 &&
                        currentPageIds.some((id) => selectedIds.includes(id)) &&
                        !isAllSelected;
                      el.indeterminate = isSomeSelected;
                    }
                  }}
                  onChange={() => {
                    const currentPageIds = paginatedFiltered.map((m) => m._id);
                    const isAllSelected =
                      currentPageIds.length > 0 &&
                      currentPageIds.every((id) => selectedIds.includes(id));
                    if (isAllSelected) {
                      setSelectedIds((prev) => prev.filter((id) => !currentPageIds.includes(id)));
                    } else {
                      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentPageIds])));
                    }
                  }}
                  className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 w-4 h-4 cursor-pointer"
                  title="Select all on this page"
                />
                {selectedIds.length > 0 ? (
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 truncate">
                      {selectedIds.length} selected
                    </span>
                    <button
                      onClick={handleBulkMarkAsRead}
                      className="ml-auto p-1 rounded-md text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Mark selected as read"
                    >
                      <FaEnvelopeOpen className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleBulkMarkAsUnread}
                      className="p-1 rounded-md text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Mark selected as unread"
                    >
                      <FaEnvelope className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="p-1 rounded-md text-gray-500 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Delete selected"
                    >
                      <FaTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 ml-auto flex-shrink-0 whitespace-nowrap">
                    {/* Items per page selector dropdown */}
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="text-[11px] font-semibold bg-transparent border-0 p-0 pr-4 text-gray-500 hover:text-primary-600 focus:ring-0 cursor-pointer appearance-none outline-none dark:bg-gray-800"
                      style={{
                        backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
                        backgroundPosition: 'right -4px center',
                        backgroundSize: '16px',
                        backgroundRepeat: 'no-repeat',
                      }}
                      title="Messages per page"
                    >
                      <option value={5}>5/page</option>
                      <option value={10}>10/page</option>
                      <option value={20}>20/page</option>
                      <option value={50}>50/page</option>
                    </select>

                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      {rangeText}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-1 rounded-md text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500 disabled:cursor-not-allowed"
                        title="Previous page"
                      >
                        <FaChevronLeft className="w-2.5 h-2.5" />
                      </button>
                      <button
                        onClick={() =>
                          setCurrentPage((p) =>
                            Math.min(Math.ceil(filtered.length / itemsPerPage), p + 1)
                          )
                        }
                        disabled={endIndex >= filtered.length}
                        className="p-1 rounded-md text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500 disabled:cursor-not-allowed"
                        title="Next page"
                      >
                        <FaChevronRight className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center gap-1 flex-shrink-0">
              {!sidebarCollapsed && (
                <button
                  onClick={() => handleRefreshAll(false)}
                  disabled={refreshing}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  title="Refresh messages"
                >
                  <FaSync className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? (
                  <FaChevronRight className="w-3.5 h-3.5" />
                ) : (
                  <FaChevronLeft className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Collapsed state: icon-only list */}
          {sidebarCollapsed ? (
            <div className="flex-1 overflow-y-auto">
              {filtered.map((msg) => (
                <button
                  key={msg._id}
                  onClick={() => {
                    setSidebarCollapsed(false);
                    handleSelectMessage(msg);
                  }}
                  title={`${msg.name} — ${msg.subject}`}
                  className={`w-full flex justify-center py-3 border-b border-gray-100 dark:border-gray-700 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                    selectedMessage?._id === msg._id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                  }`}
                >
                  {msg.read ? (
                    <FaEnvelopeOpen className="w-4 h-4 text-gray-400" />
                  ) : (
                    <FaEnvelope className="w-4 h-4 text-primary-500" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <>
              {/* Search */}
              <div className="px-3 pt-2 pb-1 flex-shrink-0">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                  <input
                    type="text"
                    placeholder="Search name, email, subject…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filter toggle */}
              <div className="px-3 pb-2 flex-shrink-0">
                <button
                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                  className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md transition-colors ${
                    showFilterPanel ||
                    statusFilter !== 'all' ||
                    readFilter !== 'all' ||
                    sortBy !== 'newest'
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <FaFilter className="w-3 h-3" />
                  Filters & Sort
                  {(statusFilter !== 'all' || readFilter !== 'all' || sortBy !== 'newest') && (
                    <span className="ml-1 bg-primary-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                      {
                        [statusFilter !== 'all', readFilter !== 'all', sortBy !== 'newest'].filter(
                          Boolean
                        ).length
                      }
                    </span>
                  )}
                </button>

                {showFilterPanel && (
                  <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 space-y-3">
                    {/* Status filter */}
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">
                        Status
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {(['all', 'pending', 'replied', 'closed'] as const).map((s) => (
                          <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`text-[11px] py-0.5 px-2 rounded-full font-medium transition-colors ${
                              statusFilter === s
                                ? 'bg-primary-500 text-white'
                                : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 hover:border-primary-400'
                            }`}
                          >
                            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Read filter */}
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">
                        Read Status
                      </p>
                      <div className="flex gap-1">
                        {(['all', 'unread', 'read'] as const).map((r) => (
                          <button
                            key={r}
                            onClick={() => setReadFilter(r)}
                            className={`text-[11px] py-0.5 px-2 rounded-full font-medium transition-colors ${
                              readFilter === r
                                ? 'bg-primary-500 text-white'
                                : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 hover:border-primary-400'
                            }`}
                          >
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sort */}
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">
                        Sort By
                      </p>
                      <div className="flex flex-col gap-1">
                        {(
                          [
                            { value: 'newest', label: '↓ Newest first' },
                            { value: 'oldest', label: '↑ Oldest first' },
                            { value: 'unread-first', label: '✉ Unread first' },
                            { value: 'name-az', label: 'A→Z Name' },
                          ] as const
                        ).map(({ value, label }) => (
                          <button
                            key={value}
                            onClick={() => setSortBy(value)}
                            className={`text-[11px] py-1 px-2 rounded-md font-medium text-left transition-colors ${
                              sortBy === value
                                ? 'bg-primary-500 text-white'
                                : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 hover:border-primary-400'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Reset */}
                    {(statusFilter !== 'all' || readFilter !== 'all' || sortBy !== 'newest') && (
                      <button
                        onClick={() => {
                          setStatusFilter('all');
                          setReadFilter('all');
                          setSortBy('newest');
                        }}
                        className="text-[11px] text-red-500 hover:text-red-600 font-medium"
                      >
                        ✕ Reset filters
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto border-t border-gray-100 dark:border-gray-700">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 p-8 text-center">
                    <FaInbox className="w-10 h-10 mb-3 opacity-40" />
                    <p className="text-sm">No messages found</p>
                    {(statusFilter !== 'all' || readFilter !== 'all' || searchQuery) && (
                      <button
                        onClick={() => {
                          setStatusFilter('all');
                          setReadFilter('all');
                          setSearchQuery('');
                        }}
                        className="mt-2 text-xs text-primary-500 hover:underline"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                ) : (
                  paginatedFiltered.map((msg) => (
                    <div
                      key={msg._id}
                      onClick={() => handleSelectMessage(msg)}
                      className={`w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-700 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${
                        selectedMessage?._id === msg._id
                          ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-l-primary-500'
                          : !msg.read
                            ? 'bg-blue-50/40 dark:bg-blue-900/10'
                            : ''
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className="flex items-center mt-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(msg._id)}
                            onChange={() => {
                              setSelectedIds((prev) =>
                                prev.includes(msg._id)
                                  ? prev.filter((x) => x !== msg._id)
                                  : [...prev, msg._id]
                              );
                            }}
                            className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 w-3.5 h-3.5 cursor-pointer"
                          />
                        </div>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            const nextRead = !msg.read;
                            try {
                              const res = await contactAPI.markAsRead(msg._id, nextRead);
                              const updated: ContactMessage = res.data.data;
                              setMessages((prev) =>
                                prev.map((m) =>
                                  m._id === updated._id ? { ...m, read: updated.read } : m
                                )
                              );
                              if (stats) {
                                setStats((s) => {
                                  if (!s) return s;
                                  const diff = nextRead ? -1 : 1;
                                  return { ...s, unread: Math.max(0, s.unread + diff) };
                                });
                              }
                              if (selectedMessage?._id === msg._id) {
                                if (!nextRead) {
                                  setSelectedMessage(null);
                                } else {
                                  setSelectedMessage((prev) =>
                                    prev ? { ...prev, read: true } : prev
                                  );
                                }
                              }
                            } catch (error) {
                              showError(error);
                            }
                          }}
                          className="flex-shrink-0 mt-1 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-gray-400 hover:text-primary-500"
                          title={msg.read ? 'Mark as unread' : 'Mark as read'}
                        >
                          {msg.read ? (
                            <FaEnvelopeOpen className="w-3.5 h-3.5" />
                          ) : (
                            <FaEnvelope className="w-3.5 h-3.5 text-primary-500" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span
                              className={`text-sm truncate ${!msg.read ? 'text-gray-900 dark:text-white font-bold' : 'text-gray-700 dark:text-gray-300 font-semibold'}`}
                            >
                              {msg.name}
                            </span>
                            <span className="text-xs text-gray-400 flex-shrink-0">
                              {formatDate(msg.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs truncate mb-1 text-gray-500 dark:text-gray-400">
                            <span
                              className={`mr-1.5 ${!msg.read ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-700 dark:text-gray-300 font-medium'}`}
                            >
                              {msg.subject}
                            </span>
                            <span className="text-gray-400 dark:text-gray-500">
                              — {getLatestMessagePreview(msg)}
                            </span>
                          </p>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-400 truncate">{msg.email}</p>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex items-center gap-1 flex-shrink-0 ${STATUS_COLORS[msg.status]}`}
                            >
                              {STATUS_ICONS[msg.status]} {msg.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Drag Handle Divider */}
        {!sidebarCollapsed && (
          <div
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizing(true);
            }}
            className={`w-1 hover:w-1.5 bg-gray-100 hover:bg-primary-500 dark:bg-gray-700 dark:hover:bg-primary-500 cursor-col-resize transition-all duration-150 relative z-10 flex-shrink-0 ${
              isResizing ? 'w-1.5 bg-primary-500 dark:bg-primary-500' : ''
            }`}
          />
        )}

        {/* ─── Right Panel: Thread View ────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {loadingMessage ? (
            <div className="flex items-center justify-center h-full">
              <FaSpinner className="animate-spin w-6 h-6 text-primary-500" />
            </div>
          ) : !selectedMessage ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 p-8 text-center">
              <FaEnvelope className="w-16 h-16 mb-4 opacity-20" />
              <h3 className="text-lg font-semibold mb-2 text-gray-500 dark:text-gray-400">
                Select a message
              </h3>
              <p className="text-sm">Choose a conversation from the list to read it here</p>
            </div>
          ) : (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                      {selectedMessage.subject}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      From:{' '}
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {selectedMessage.name}
                      </span>{' '}
                      &lt;{selectedMessage.email}&gt;
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Status Dropdown */}
                    <div className="relative">
                      <select
                        value={selectedMessage.status}
                        onChange={(e) =>
                          handleStatusChange(e.target.value as 'pending' | 'replied' | 'closed')
                        }
                        disabled={updatingStatus}
                        className={`text-xs px-2 py-1 rounded-full border-0 font-medium cursor-pointer appearance-none pr-5 focus:ring-2 focus:ring-primary-500 ${STATUS_COLORS[selectedMessage.status]}`}
                      >
                        <option value="pending">● Pending</option>
                        <option value="replied">● Replied</option>
                        <option value="closed">● Closed</option>
                      </select>
                      {updatingStatus && (
                        <FaSpinner className="animate-spin w-3 h-3 absolute right-1 top-1/2 -translate-y-1/2 text-gray-500" />
                      )}
                    </div>
                    {/* Toggle Read/Unread Button */}
                    <button
                      onClick={async () => {
                        const nextRead = !selectedMessage.read;
                        try {
                          const res = await contactAPI.markAsRead(selectedMessage._id, nextRead);
                          const updated: ContactMessage = res.data.data;
                          setMessages((prev) =>
                            prev.map((m) =>
                              m._id === updated._id ? { ...m, read: updated.read } : m
                            )
                          );
                          if (stats) {
                            setStats((s) => {
                              if (!s) return s;
                              const diff = nextRead ? -1 : 1;
                              return { ...s, unread: Math.max(0, s.unread + diff) };
                            });
                          }
                          if (!nextRead) {
                            setSelectedMessage(null); // Return to list view when marked as unread
                          } else {
                            setSelectedMessage((prev) => (prev ? { ...prev, read: true } : prev));
                          }
                        } catch (error) {
                          showError(error);
                        }
                      }}
                      className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title={selectedMessage.read ? 'Mark as unread' : 'Mark as read'}
                    >
                      {selectedMessage.read ? (
                        <FaEnvelope className="w-3.5 h-3.5" />
                      ) : (
                        <FaEnvelopeOpen className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {/* Delete Button */}
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={!!deletingId}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete conversation"
                    >
                      <FaTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Delete Confirm Banner */}
              {showDeleteConfirm && (
                <div className="mx-4 mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between flex-shrink-0">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Delete this conversation permanently?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="text-sm px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={!!deletingId}
                      className="text-sm px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
                    >
                      {deletingId ? <FaSpinner className="animate-spin w-3 h-3" /> : null}
                      Delete
                    </button>
                  </div>
                </div>
              )}

              {/* Conversation Thread */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Original Message */}
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {selectedMessage.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-semibold text-sm text-gray-900 dark:text-white">
                        {selectedMessage.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(selectedMessage.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl rounded-tl-sm p-4 shadow-sm">
                      <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                        {selectedMessage.message}
                      </p>
                      {selectedMessage.attachments?.length > 0 && (
                        <AttachmentList attachments={selectedMessage.attachments} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Replies — user bubbles on LEFT, admin bubbles on RIGHT */}
                {selectedMessage.replies.map((reply) => {
                  const isUser = reply.sender === 'user';
                  return isUser ? (
                    // User reply — left-aligned teal bubble
                    <div key={reply._id} className="flex gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        <FaUser className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="font-semibold text-sm text-teal-700 dark:text-teal-300">
                            {selectedMessage.name}
                          </span>
                          <span className="text-[10px] bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 px-1.5 py-0.5 rounded-full font-medium">
                            via email
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(reply.sentAt).toLocaleString()}
                          </span>
                        </div>
                        {reply.content === '__NO_BODY__' ? (
                          // Resend inbound API doesn't expose email body — show notification badge
                          <div className="flex items-center gap-2 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700 border-dashed rounded-xl rounded-tl-sm px-4 py-3 shadow-sm max-w-[85%]">
                            <FaEnvelope className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                            <span className="text-sm text-teal-700 dark:text-teal-300 italic">
                              {selectedMessage.name} replied via email — check your inbox for the
                              full message.
                            </span>
                          </div>
                        ) : (
                          <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700 rounded-xl rounded-tl-sm p-4 shadow-sm max-w-[85%]">
                            <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                              {reply.content}
                            </p>
                            {reply.attachments?.length > 0 && (
                              <AttachmentList attachments={reply.attachments} />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    // Admin reply — right-aligned primary bubble (existing)
                    <div key={reply._id} className="flex gap-3 justify-end">
                      <div className="flex-1 min-w-0 flex flex-col items-end">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-xs text-gray-400">
                            {new Date(reply.sentAt).toLocaleString()}
                          </span>
                          <span className="font-semibold text-sm text-primary-600 dark:text-primary-400">
                            You
                          </span>
                        </div>
                        <div className="bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-700 rounded-xl rounded-tr-sm p-4 shadow-sm max-w-[85%]">
                          <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                            {reply.content}
                          </p>
                          {reply.attachments?.length > 0 && (
                            <AttachmentList attachments={reply.attachments} />
                          )}
                        </div>
                      </div>
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        A
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Composer */}
              {selectedMessage.status !== 'closed' && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 bg-gray-50 dark:bg-gray-800/40">
                  {/* Attached file chips */}
                  {replyAttachments.length > 0 && (
                    <ul className="mb-3 flex flex-wrap gap-2">
                      {replyAttachments.map((f, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1 shadow-sm text-xs"
                        >
                          <span className="flex-shrink-0">{attachmentIcon(f.type)}</span>
                          <span
                            className="text-gray-800 dark:text-gray-200 truncate max-w-[120px]"
                            title={f.name}
                          >
                            {f.name}
                          </span>
                          <span className="text-[10px] text-gray-400 flex-shrink-0">
                            {formatBytes(f.size)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeReplyAttachment(i)}
                            className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors ml-1"
                          >
                            <FaTimesCircle className="w-3.5 h-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Attachment errors */}
                  {replyAttachmentErrors.length > 0 && (
                    <ul className="mb-3 space-y-1">
                      {replyAttachmentErrors.map((e, i) => (
                        <li key={i} className="text-xs text-red-500 flex items-center gap-1">
                          <FaTimesCircle className="w-3 h-3 flex-shrink-0" />
                          {e}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="flex gap-3 items-end">
                    <div className="flex-1 relative">
                      <textarea
                        ref={replyRef}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder={`Reply to ${selectedMessage.name}...`}
                        rows={3}
                        className="w-full pl-4 pr-12 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                            handleReply();
                          }
                        }}
                      />
                      {/* Attachment Button nested inside textarea */}
                      <button
                        type="button"
                        onClick={() => replyFileInputRef.current?.click()}
                        className="absolute right-3.5 bottom-3.5 p-1.5 rounded-lg text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        title="Add attachment"
                      >
                        <FaPaperclip className="w-4 h-4" />
                      </button>
                      <input
                        ref={replyFileInputRef}
                        type="file"
                        multiple
                        accept={ALLOWED_TYPES.join(',')}
                        className="hidden"
                        onChange={handleReplyFileInput}
                      />
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                      <button
                        onClick={handleReply}
                        disabled={sendingReply || !replyContent.trim()}
                        className="px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium text-sm"
                      >
                        {sendingReply ? (
                          <FaSpinner className="animate-spin w-4 h-4" />
                        ) : (
                          <FaPaperPlane className="w-4 h-4" />
                        )}
                        {sendingReply ? 'Sending...' : 'Send'}
                      </button>
                      <p className="text-[10px] text-gray-400 text-center select-none">
                        Ctrl+Enter
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {selectedMessage.status === 'closed' && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                  <div className="flex items-center justify-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400 text-sm">
                    <FaTimesCircle className="w-4 h-4" />
                    This conversation is closed. Change status to reply.
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactManager;
