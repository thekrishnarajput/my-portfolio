import { useState, useEffect } from 'react';
import { visitorsAPI } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { FaUsers, FaChevronLeft, FaChevronRight, FaGlobe, FaClock, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

interface Visitor {
  _id: string;
  visitorId: string;
  ipAddress?: string;
  userAgent?: string;
  lastVisit: string;
  visitCount: number;
  createdAt: string;
}

interface VisitorsResponse {
  visitors: Visitor[];
  total: number;
  totalPages: number;
  currentPage: number;
}

type SortField = 'visitorId' | 'ipAddress' | 'lastVisit' | 'visitCount' | 'createdAt';
type SortOrder = 'asc' | 'desc';

const VisitorsManager = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [uniqueVisitors, setUniqueVisitors] = useState(0);
  const [totalVisits, setTotalVisits] = useState(0);
  const [limit, setLimit] = useState(25);
  const [sortBy, setSortBy] = useState<SortField>('lastVisit');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const { showError } = useToast();

  useEffect(() => {
    fetchVisitors();
    fetchCounts();
  }, [currentPage, sortBy, sortOrder, limit]);

  const fetchVisitors = async () => {
    setLoading(true);
    try {
      const response = await visitorsAPI.getAll(currentPage, limit, sortBy, sortOrder);
      const data: VisitorsResponse = response.data.data;
      setVisitors(data.visitors);
      setTotalPages(data.totalPages);
      setUniqueVisitors(data.total);
    } catch (error: any) {
      console.error('Error fetching visitors:', error);
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCounts = async () => {
    try {
      const response = await visitorsAPI.getCount();
      if (response.data.success) {
        const counts = response.data.data;
        setUniqueVisitors(counts.uniqueVisitors || 0);
        setTotalVisits(counts.totalVisits || 0);
      }
    } catch (error) {
      console.error('Error fetching visitor counts:', error);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to descending
      setSortBy(field);
      setSortOrder('desc');
    }
    // Reset to first page when sorting changes
    setCurrentPage(1);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = parseInt(e.target.value);
    setLimit(newLimit);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) {
      return <FaSort className="w-3 h-3 text-gray-400 ml-1" />;
    }
    return sortOrder === 'asc' ? (
      <FaSortUp className="w-3 h-3 text-primary-600 dark:text-primary-400 ml-1" />
    ) : (
      <FaSortDown className="w-3 h-3 text-primary-600 dark:text-primary-400 ml-1" />
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getBrowserInfo = (userAgent?: string) => {
    if (!userAgent) return 'Unknown';
    
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    
    return 'Other';
  };

  const getDeviceInfo = (userAgent?: string) => {
    if (!userAgent) return 'Unknown';
    
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      if (/iPad/.test(userAgent)) return 'Tablet';
      return 'Mobile';
    }
    return 'Desktop';
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading visitors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaUsers className="text-2xl text-primary-600 dark:text-primary-400" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Visitors</h2>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>Total Visits: <strong className="text-primary-600 dark:text-primary-400">{totalVisits.toLocaleString()}</strong></span>
              <span>Unique: <strong className="text-primary-600 dark:text-primary-400">{uniqueVisitors.toLocaleString()}</strong></span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
            Page Size:
            <select
              value={limit}
              onChange={handlePageSizeChange}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </label>
        </div>
      </div>

      {visitors.length === 0 ? (
        <div className="text-center py-12">
          <FaUsers className="mx-auto text-4xl text-gray-400 dark:text-gray-600 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No visitors found</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th
                    className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors select-none"
                    onClick={() => handleSort('visitorId')}
                  >
                    <div className="flex items-center">
                      Visitor ID
                      <SortIcon field="visitorId" />
                    </div>
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors select-none"
                    onClick={() => handleSort('ipAddress')}
                  >
                    <div className="flex items-center">
                      IP Address
                      <SortIcon field="ipAddress" />
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Device
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Browser
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors select-none"
                    onClick={() => handleSort('visitCount')}
                  >
                    <div className="flex items-center">
                      Visits
                      <SortIcon field="visitCount" />
                    </div>
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors select-none"
                    onClick={() => handleSort('lastVisit')}
                  >
                    <div className="flex items-center">
                      Last Visit
                      <SortIcon field="lastVisit" />
                    </div>
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors select-none"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center">
                      First Visit
                      <SortIcon field="createdAt" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visitors.map((visitor) => (
                  <tr
                    key={visitor._id}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-200">
                        {visitor.visitorId.substring(0, 16)}...
                      </code>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <FaGlobe className="text-gray-400" />
                        {visitor.ipAddress || 'Unknown'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {getDeviceInfo(visitor.userAgent)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {getBrowserInfo(visitor.userAgent)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
                        {visitor.visitCount}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <FaClock className="text-gray-400" />
                        {formatDate(visitor.lastVisit)}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(visitor.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {(currentPage - 1) * limit + 1} to{' '}
                {Math.min(currentPage * limit, uniqueVisitors)} of {uniqueVisitors} unique visitors
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <FaChevronLeft className="w-3 h-3" />
                  Previous
                </button>
                <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  Next
                  <FaChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VisitorsManager;
