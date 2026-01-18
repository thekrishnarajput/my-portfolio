import { useEffect } from 'react';
import { ToastContainer as ReactToastContainer } from 'react-toastify';
import { useTheme } from '../contexts/ThemeContext';
import 'react-toastify/dist/ReactToastify.css';

/**
 * Theme-aware Toast Container Component
 * Automatically applies light/dark theme based on current theme context
 */
const ToastContainer = () => {
  const { theme } = useTheme();

  useEffect(() => {
    // Update toast container theme when theme changes
    const toastContainer = document.querySelector('.Toastify__toast-container');
    if (toastContainer) {
      if (theme === 'dark') {
        toastContainer.classList.add('toast-dark');
        toastContainer.classList.remove('toast-light');
      } else {
        toastContainer.classList.add('toast-light');
        toastContainer.classList.remove('toast-dark');
      }
    }
  }, [theme]);

  const progressBarClass = theme === 'dark'
    ? 'Toastify__progress-bar--dark'
    : 'Toastify__progress-bar--light';

  return (
    <ReactToastContainer
      position="bottom-center"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={theme === 'dark' ? 'dark' : 'light'}
      style={{
        zIndex: 9999,
      }}
      toastClassName="relative rounded-md cursor-pointer"
      progressClassName={progressBarClass}
    />
  );
};

export default ToastContainer;
