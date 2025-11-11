import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BottomNav from './BottomNav';
import {
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  ArchiveBoxIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

export default function Layout() {
  const { user, logout, bypassMode } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: DocumentTextIcon },
    { name: 'Review Queue', href: '/review', icon: ClipboardDocumentCheckIcon, roles: ['reviewer1', 'reviewer2', 'reviewer3', 'admin'] },
    { name: 'Approval Queue', href: '/approve', icon: CheckCircleIcon, roles: ['approver', 'admin'] },
    { name: 'Sign Queue', href: '/sign', icon: PencilSquareIcon, roles: ['signer', 'admin'] },
    { name: 'Archive', href: '/archive', icon: ArchiveBoxIcon },
  ];

  const filteredNavigation = navigation.filter(
    (item) => !item.roles || item.roles.includes(user?.role)
  );

  return (
    <div className="min-h-screen bg-gray-100 pb-16 md:pb-0">
      {bypassMode && (
        <div className="bg-yellow-400 text-black text-center py-1 text-xs font-semibold">
          ⚠️ DEVELOPMENT MODE - Bypass Authentication Active
        </div>
      )}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Workflow Management</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {filteredNavigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`${
                        location.pathname === item.href
                          ? 'border-blue-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      <Icon className="h-5 w-5 mr-2" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-sm text-gray-700 mr-4 hidden sm:inline">
                  {user?.full_name} ({user?.role})
                </span>
                <button
                  onClick={logout}
                  className="inline-flex items-center px-3 py-2 sm:px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 sm:mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <BottomNav user={user} />
    </div>
  );
}
