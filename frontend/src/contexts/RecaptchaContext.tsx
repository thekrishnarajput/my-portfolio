import React, { createContext, useContext, useEffect, useState } from 'react';

declare global {
  interface Window {
    grecaptcha: any;
    onRecaptchaLoad: () => void;
  }
}

interface RecaptchaContextType {
  executeRecaptcha?: (action: string) => Promise<string>;
  recaptchaError?: string;
}

const RecaptchaContext = createContext<RecaptchaContextType>({});

export const useRecaptcha = () => useContext(RecaptchaContext);

export const RecaptchaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [executeRecaptcha, setExecuteRecaptcha] = useState<((action: string) => Promise<string>) | undefined>(undefined);
  const [recaptchaError, setRecaptchaError] = useState<string | undefined>(undefined);
  const isDisabled = import.meta.env.VITE_DISABLE_RECAPTCHA === 'true';
  // Using explicit fallback for the public key in case the deployment environment fails to inject it.
  // ReCAPTCHA v3 site keys are designed to be public and exposed to the client browser anyway.
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LenX7AsAAAAAD6GLHX_K-fhl29FnIUm_jS-0zdv';

  useEffect(() => {
    // If reCAPTCHA is disabled (e.g. local dev), skip loading script and return a bypass token
    if (isDisabled) {
      console.warn('[reCAPTCHA] Disabled via VITE_DISABLE_RECAPTCHA. Returning bypass token.');
      setExecuteRecaptcha(() => async (_action: string) => 'RECAPTCHA_DISABLED_BYPASS_TOKEN');
      return;
    }

    if (!siteKey) {
      console.warn('reCAPTCHA site key is missing!');
      setRecaptchaError('Site verification key missing.');
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
    // Using both onload and a fallback interval to ensure it initializes regardless of Google script behavior
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}&onload=onRecaptchaLoad`;
    script.async = true;
    script.defer = true;
    
    script.onerror = () => {
      console.error('Network error or AdBlocker prevented ReCAPTCHA from loading.');
      setRecaptchaError('Script blocked or failed to load.');
    };

    window.onRecaptchaLoad = () => {
      initRecaptcha();
    };
    
    document.body.appendChild(script);

    // Fallback polling just in case onload doesn't trigger (known ReCAPTCHA quirk)
    const interval = setInterval(() => {
      if (window.grecaptcha && window.grecaptcha.ready) {
        initRecaptcha();
        clearInterval(interval);
      }
    }, 500);

    return () => {
      clearInterval(interval);
      if (document.getElementById('recaptcha-script')) {
        document.body.removeChild(script);
        delete (window as any).onRecaptchaLoad;
      }
    };
  }, [siteKey, isDisabled]);

  return (
    <RecaptchaContext.Provider value={{ executeRecaptcha, recaptchaError }}>
      {children}
    </RecaptchaContext.Provider>
  );
};
