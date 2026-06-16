import React, { useState, useEffect } from 'react';

const PrivacyConsentModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);

  useEffect(() => {
    const hasAccepted = localStorage.getItem('prc_privacy_accepted_v3');
    if (!hasAccepted) {
      // Prevent scrolling when modal is open
      document.body.style.overflow = 'hidden';
      setIsOpen(true);
    }
  }, []);

  const handleAgree = () => {
    if (!isAgreed) return;
    localStorage.setItem('prc_privacy_accepted_v3', 'true');
    document.body.style.overflow = 'auto';
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-300"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 bg-white text-center">
          <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-2xl mb-3 border border-blue-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">PRC Data Privacy Notice</h2>
          <p className="text-sm font-medium text-gray-500 mt-1">Professional Regulation Commission</p>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5 mb-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Privacy Statement</h4>
                <p className="text-blue-800 text-sm leading-relaxed">
                  The Professional Regulation Commission (PRC) is committed to protecting your privacy and ensuring that all personal data collected are processed in accordance with the Data Privacy Act of 2012 (Republic Act No. 10173).
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 text-sm text-gray-600 space-y-4 shadow-sm">
            <div>
              <strong className="text-gray-900 block mb-1">1. Data Collected & Methods</strong>
              <p>The PRC collects personal information either manually or electronically through transactional websites (LERIS, CPDAS, ACOAS, CRMS) including complete name, date of birth, license number, etc. We also use Google Analytics for web traffic data.</p>
            </div>
            <div>
              <strong className="text-gray-900 block mb-1">2. Purpose of Collection</strong>
              <p>Data is used to perform mandates relative to regulation and licensing of professions, provide better service, and respond to data privacy rights requests.</p>
            </div>
            <div>
              <strong className="text-gray-900 block mb-1">3. Disclosure & Security</strong>
              <p>Information is only shared if required by law. The PRC implements technical, physical, and organizational security measures to protect your personal data against unauthorized access or breaches.</p>
            </div>
            <div>
              <strong className="text-gray-900 block mb-1">4. Rights of Data Subjects</strong>
              <p>You have the right to be informed, access, object, erasure, damages, rectification, data portability, and to file a complaint before the PRC.</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-white border-t border-gray-100">
          <div 
            className={`border-2 rounded-xl p-4 mb-5 transition-colors cursor-pointer select-none flex items-start gap-4 ${isAgreed ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200 hover:border-blue-200'}`}
            onClick={() => setIsAgreed(!isAgreed)}
          >
            <div className="flex items-center mt-0.5 shrink-0">
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isAgreed ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
                {isAgreed && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-gray-900">I acknowledge and agree</span> that I have read, understood, and accept the PRC Privacy Notice. I understand how my personal information is collected, used, and protected.
            </p>
          </div>

          <button
            onClick={handleAgree}
            disabled={!isAgreed}
            className={`w-full py-3.5 px-6 rounded-xl text-sm font-semibold text-white shadow-sm transition-all ${
              isAgreed
                ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-md transform hover:-translate-y-0.5'
                : 'bg-gray-300 cursor-not-allowed opacity-80'
            }`}
          >
            Agree and Continue to Website
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyConsentModal;
