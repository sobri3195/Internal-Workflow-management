import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  ClipboardDocumentCheckIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  ClipboardDocumentCheckIcon as ClipboardIconSolid,
  CheckCircleIcon as CheckIconSolid,
  PencilSquareIcon as PencilIconSolid,
  ArchiveBoxIcon as ArchiveIconSolid,
} from '@heroicons/react/24/solid';

export default function BottomNav({ user }) {
  const location = useLocation();

  const navigation = [
    { 
      name: 'Home', 
      href: '/', 
      icon: HomeIcon,
      iconSolid: HomeIconSolid,
      show: true
    },
    { 
      name: 'Review', 
      href: '/review', 
      icon: ClipboardDocumentCheckIcon,
      iconSolid: ClipboardIconSolid,
      show: user && ['reviewer1', 'reviewer2', 'reviewer3', 'admin'].includes(user?.role)
    },
    { 
      name: 'Approve', 
      href: '/approve', 
      icon: CheckCircleIcon,
      iconSolid: CheckIconSolid,
      show: user && ['approver', 'admin'].includes(user?.role)
    },
    { 
      name: 'Sign', 
      href: '/sign', 
      icon: PencilSquareIcon,
      iconSolid: PencilIconSolid,
      show: user && ['signer', 'admin'].includes(user?.role)
    },
    { 
      name: 'Archive', 
      href: '/archive', 
      icon: ArchiveBoxIcon,
      iconSolid: ArchiveIconSolid,
      show: true
    },
  ];

  const filteredNavigation = navigation.filter(item => item.show);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
      <div className="flex justify-around items-center h-16">
        {filteredNavigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = isActive ? item.iconSolid : item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full ${
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
