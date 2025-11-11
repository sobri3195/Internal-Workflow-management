import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DocumentCreate from './pages/DocumentCreate';
import DocumentEdit from './pages/DocumentEdit';
import DocumentView from './pages/DocumentView';
import ReviewQueue from './pages/ReviewQueue';
import ApprovalQueue from './pages/ApprovalQueue';
import SignQueue from './pages/SignQueue';
import Archive from './pages/Archive';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="documents/create" element={<DocumentCreate />} />
          <Route path="documents/:id/edit" element={<DocumentEdit />} />
          <Route path="documents/:id" element={<DocumentView />} />
          <Route path="review" element={<ReviewQueue />} />
          <Route path="approve" element={<ApprovalQueue />} />
          <Route path="sign" element={<SignQueue />} />
          <Route path="archive" element={<Archive />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
