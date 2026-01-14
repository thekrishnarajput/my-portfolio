import { Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Footer from './components/Footer';
import VisitorCounter from './components/VisitorCounter';
import ScrollToTop from './components/ScrollToTop';
import RocketScrollToTop from './components/RocketScrollToTop';
import ToastContainer from './components/ToastContainer';
import SEO from './components/SEO';

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin';

  return (
    <>
      <SEO
        url={location.pathname}
        title={location.pathname === '/admin' ? 'Admin Panel' : undefined}
        description={
          location.pathname === '/admin'
            ? 'Admin panel for portfolio management'
            : undefined
        }
      />
      <div className="min-h-screen flex flex-col">
        <ScrollToTop />
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        {!isAdminPage && <VisitorCounter />}
        <Footer />
        <RocketScrollToTop />
        <ToastContainer />
      </div>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

