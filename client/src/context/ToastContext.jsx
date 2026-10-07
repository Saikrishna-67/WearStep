import React, { createContext, useContext, useState } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({ show: false, message: '' });
  let timer;

  const showToast = (message) => {
    setToast({ show: true, message });
    clearTimeout(timer);
    timer = setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 2500);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className={`toast ${toast.show ? 'show' : ''}`} id="toast">
        <span className="dotY"></span>
        <span id="toastMsg">{toast.message}</span>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
