import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Users, 
  Package, 
  DollarSign, 
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Shirt,
  ShoppingCart
} from 'lucide-react';

// Define TypeScript interfaces
interface MenuItem {
  icon: React.ComponentType<any>;
  label: string;
  href: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<any>;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

interface Order {
  id: string;
  customer: string;
  amount: number;
  status: 'completed' | 'processing' | 'pending';
}

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

// Stats Card Component
const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon: Icon, color = 'blue' }) => {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change !== undefined && (
            <p className={`text-sm font-medium mt-1 ${
              change > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change > 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className={`w-12 h-12 bg-gradient-to-r ${colors[color]} rounded-xl flex items-center justify-center`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
};

// Admin Layout Component
export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('user');
      document.cookie = 'auth_token=; max-age=0; path=/';
    }
    router.push('/auth/login');
  };

  const menuItems: MenuItem[] = [
    { icon: BarChart3, label: 'Dashboard', href: '/admin' },
    { icon: Package, label: 'Products', href: '/admin/products' },
    { icon: Users, label: 'Customers', href: '/admin/customers' },
    { icon: ShoppingBag, label: 'Orders', href: '/admin/orders' },
    { icon: DollarSign, label: 'Revenue', href: '/admin/revenue' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`flex-shrink-0 w-64 bg-white shadow-lg transform transition-transform duration-300 lg:translate-x-0 lg:static ${
        sidebarOpen ? 'translate-x-0 fixed inset-y-0 left-0 z-50' : '-translate-x-full fixed'
      }`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Shirt className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">FashionPro</h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-lg hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = router.pathname === item.href;
              return (
                <Link key={item.href} href={item.href} legacyBehavior>
                  <a className={`flex items-center space-x-3 p-3 rounded-xl transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}>
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </a>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all w-full"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b flex-shrink-0">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">FashionPro Admin</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <Shirt className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

// Main Admin Dashboard Component
const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const router = useRouter();

  useEffect(() => {
    const checkAdminAuth = () => {
      if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem('user');
        let user = { role: '' };
        
        try {
          user = userStr ? JSON.parse(userStr) : { role: '' };
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
        
        console.log('👤 Current user role:', user.role);
        
        if (user.role !== 'admin') {
          console.log('❌ Access denied - not an admin');
          router.push('/auth/login');
          return false;
        }
        
        console.log('✅ Admin access granted');
        return true;
      }
      return false;
    };

    if (!checkAdminAuth()) {
      return;
    }

    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      setStats({
        totalRevenue: 32467.89,
        totalOrders: 542,
        totalProducts: 89,
        totalCustomers: 234,
      });

      setRecentOrders([
        { id: 'ORD-FP001', customer: 'Sarah Johnson', amount: 189.99, status: 'completed' },
        { id: 'ORD-FP002', customer: 'Mike Chen', amount: 299.50, status: 'processing' },
        { id: 'ORD-FP003', customer: 'Emma Wilson', amount: 124.75, status: 'pending' },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  return (
    <AdminLayout title="Dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          change={18.5}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          change={12.2}
          icon={ShoppingCart}
          color="blue"
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts.toLocaleString()}
          change={8.7}
          icon={Package}
          color="purple"
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers.toLocaleString()}
          change={22.3}
          icon={Users}
          color="orange"
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900">{order.id}</p>
                  <p className="text-sm text-gray-600">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">${order.amount}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <Link href="/admin/orders" legacyBehavior>
              <a className="inline-block px-6 py-2 text-blue-600 hover:text-blue-700 font-semibold border-2 border-blue-600 hover:border-blue-700 rounded-xl hover:bg-blue-50 transition-all">
                View All Orders
              </a>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;