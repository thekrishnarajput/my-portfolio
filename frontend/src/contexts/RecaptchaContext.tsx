import React, { createContext, useContext, useEffect, useState } from 'react';

declare global {
  interface Window {
    grecaptcha: any;
    onRecaptchaLoad: () => void;
  }
}

interface RecaptchaContextType {
  executeRecaptcha?: (action: string) => Promise<string>;
}

const RecaptchaContext = createContext<RecaptchaContextType>({});

export const useRecaptcha = () => useContext(RecaptchaContext);

export const RecaptchaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [executeRecaptcha, setExecuteRecaptcha] = useState<((action: string) => Promise<string>) | undefined>(undefined);
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

  useEffect(() => {
    if (!siteKey) {
      console.warn('reCAPTCHA site key is missing!');
      return;
    }

    const initRecaptcha = () => {
      if (window.grecaptcha && window.grecaptcha.ready) {
        window.grecaptcha.ready(() => {
          setExecuteRecaptcha(() => async (action: string) => {
            try {
              const token = await window.grecaptcha.execute(siteKey, { action });
              return token;
            } catch (error) {
              console.error('reCAPTCHA execution failed:', error);
              throw error;
            }
          });
          console.log('reCAPTCHA v3 script loaded and ready!');
        });
      }
    };

    if (document.getElementById('recaptcha-script')) {
      initRecaptcha();
      return;
    }

    const script = document.createElement('script');
    script.id = 'recaptcha-script';
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}&onload=onRecaptchaLoad`;
    script.async = true;
    script.defer = true;
    
    window.onRecaptchaLoad = () => {
      initRecaptcha();
    };
    
    document.body.appendChild(script);

    return () => {
      if (document.getElementById('recaptcha-script')) {
        document.body.removeChild(script);
        delete (window as any).onRecaptchaLoad;
      }
    };
  }, [siteKey]);

  return (
    <RecaptchaContext.Provider value={{ executeRecaptcha }}>
      {children}
    </RecaptchaContext.Provider>
  );
};
