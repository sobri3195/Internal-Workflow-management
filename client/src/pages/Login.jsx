import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBypass, setShowBypass] = useState(false);
  const [selectedRole, setSelectedRole] = useState('admin');
  const { login, bypassLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(username, password);
      toast.success('Login berhasil!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  const handleBypassLogin = () => {
    bypassLogin(selectedRole);
    toast.success(`Bypass login sebagai ${selectedRole}!`);
    navigate('/');
  };

  const roles = [
    { value: 'admin', label: 'Admin' },
    { value: 'submitter', label: 'Submitter' },
    { value: 'reviewer1', label: 'Reviewer 1' },
    { value: 'reviewer2', label: 'Reviewer 2' },
    { value: 'reviewer3', label: 'Reviewer 3' },
    { value: 'approver', label: 'Approver' },
    { value: 'signer', label: 'Signer' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Workflow Management System
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Silakan login untuk melanjutkan
          </p>
        </div>
        
        {!showBypass ? (
          <>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="username" className="sr-only">
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                  {loading ? 'Loading...' : 'Sign in'}
                </button>
              </div>
            </form>
            
            <div className="text-center text-sm text-gray-600">
              <p>Demo credentials:</p>
              <p>Username: admin | Password: password123</p>
            </div>

            <div className="text-center">
              <button
                onClick={() => setShowBypass(true)}
                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                Development Mode (Bypass Login)
              </button>
            </div>
          </>
        ) : (
          <div className="mt-8 space-y-6">
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Pilih Role untuk Development
              </label>
              <select
                id="role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              >
                {roles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <button
                onClick={handleBypassLogin}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Bypass Login sebagai {roles.find(r => r.value === selectedRole)?.label}
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={() => setShowBypass(false)}
                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                Kembali ke Login Normal
              </button>
            </div>

            <div className="text-center text-xs text-gray-500 bg-yellow-50 p-3 rounded-md border border-yellow-200">
              <p className="font-semibold mb-1">⚠️ Development Mode</p>
              <p>Mode ini bypass autentikasi backend dan hanya untuk development/testing.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
