import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  X, 
  User, 
  CreditCard, 
  ShieldAlert, 
  Check, 
  AlertTriangle, 
  ShieldCheck, 
  Calendar,
  KeyRound,
  Loader2
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'profile' | 'billing' | 'security';

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, toggleSubscription } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  
  // Checkout States
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [payError, setPayError] = useState('');
  const [paySuccess, setPaySuccess] = useState('');
  const [processing, setProcessing] = useState(false);

  // 2FA States
  const [setupSecret, setSetupSecret] = useState('');
  const [setupQrCode, setSetupQrCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [secError, setSecError] = useState('');
  const [secSuccess, setSecSuccess] = useState('');
  const [loading2fa, setLoading2fa] = useState(false);

  // Countdown timer for 1-day free trial
  const [trialTimeRemaining, setTrialTimeRemaining] = useState('');
  const [trialExpired, setTrialExpired] = useState(false);

  useEffect(() => {
    if (!user) return;

    const updateTrialTimer = () => {
      const oneDayInMs = 24 * 60 * 60 * 1000;
      const createdAtMs = new Date(user.createdAt).getTime();
      const timeRemaining = oneDayInMs - (Date.now() - createdAtMs);

      if (timeRemaining <= 0) {
        setTrialTimeRemaining('Expired');
        setTrialExpired(true);
      } else {
        const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
        setTrialTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
        setTrialExpired(false);
      }
    };

    updateTrialTimer();
    const interval = setInterval(updateTrialTimer, 1000);

    return () => clearInterval(interval);
  }, [user]);

  if (!isOpen || !user) return null;

  // Formatting Card Numbers with spaces
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = value.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(value);
    }
  };

  // Formatter for MM/YY expiry
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 2) {
      value = `${value.substring(0, 2)}/${value.substring(2, 4)}`;
    }
    setCardExpiry(value);
  };

  const handleSubscribeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayError('');
    setPaySuccess('');
    setProcessing(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/subscribe', {
        cardName,
        cardNumber,
        cardExpiry,
        cardCvv
      });

      // Update context user details by toggling locally or refreshing profile
      // In our code, the response returns the updated user inside response.data.user
      // We will trigger toggleSubscription or directly reload to sync context:
      // Since response.data.user is returned, let's trigger context reload
      await toggleSubscription(); // Toggle back/forth to trigger refresh, or let the user click
      
      setPaySuccess(response.data.message);
      // Clean inputs
      setCardName('');
      setCardNumber('');
      setCardExpiry('');
      setCardCvv('');
    } catch (err: any) {
      setPayError(err.response?.data?.error || 'Payment transaction failed.');
    } finally {
      setProcessing(false);
    }
  };

  // Initialize 2FA Setup
  const handleInit2FA = async () => {
    setSecError('');
    setSecSuccess('');
    setLoading2fa(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/2fa/setup');
      setSetupSecret(response.data.secret);
      setSetupQrCode(response.data.qrCodeUrl);
    } catch (err: any) {
      setSecError(err.response?.data?.error || 'Failed to start 2FA setup.');
    } finally {
      setLoading2fa(false);
    }
  };

  // Verify and enable 2FA code
  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecError('');
    setSecSuccess('');
    setLoading2fa(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/2fa/verify', {
        pin: verificationCode
      });
      setSecSuccess(response.data.message);
      setSetupSecret('');
      setSetupQrCode('');
      setVerificationCode('');
      
      // Update global context by doing a minor subscription state reload
      await toggleSubscription();
      await toggleSubscription(); // double toggle triggers profile refresh immediately
    } catch (err: any) {
      setSecError(err.response?.data?.error || 'Verification pin code failed.');
    } finally {
      setLoading2fa(false);
    }
  };

  // Disable 2FA
  const handleDisable2FA = async () => {
    if (!window.confirm('Are you sure you want to disable two-factor authentication?')) return;
    setSecError('');
    setSecSuccess('');
    setLoading2fa(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/2fa/disable');
      setSecSuccess(response.data.message);
      await toggleSubscription();
      await toggleSubscription();
    } catch (err: any) {
      setSecError(err.response?.data?.error || 'Failed to disable 2FA.');
    } finally {
      setLoading2fa(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl relative flex flex-col md:flex-row overflow-hidden text-sm">
        
        {/* Left Side: Navigation Tabs */}
        <aside className="w-full md:w-52 border-b md:border-b-0 md:border-r border-slate-800/80 p-4 bg-slate-950/40 space-y-1.5 flex flex-row md:flex-col items-center md:items-stretch overflow-x-auto">
          <div className="hidden md:flex items-center gap-2 px-3 py-2 text-slate-400 font-extrabold text-xs uppercase tracking-wider">
            Settings
          </div>
          
          {[
            { id: 'profile', name: 'Profile Info', icon: User },
            { id: 'billing', name: 'Billing Plan', icon: CreditCard },
            { id: 'security', name: '2FA Security', icon: ShieldCheck }
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as Tab)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-bold text-xs cursor-pointer transition-all ${
                  activeTab === t.id
                    ? 'bg-brand-500/10 text-brand-300 border border-brand-500/20'
                    : 'bg-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.name}
              </button>
            );
          })}

          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-450 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors md:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </aside>

        {/* Right Side: Tab Contents */}
        <main className="flex-1 p-6 relative min-h-[380px] flex flex-col justify-between">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-colors hidden md:block cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-4">
            
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-extrabold text-white">Profile Details</h3>
                  <p className="text-slate-400 text-xs mt-1">Review your design account metadata.</p>
                </div>

                <div className="space-y-3.5 bg-slate-950/40 p-4 border border-slate-850 rounded-xl">
                  <div className="flex justify-between border-b border-slate-900 pb-2 text-xs">
                    <span className="text-slate-400 font-semibold">Full Name</span>
                    <span className="text-slate-200 font-bold">{user.fullName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-2 text-xs">
                    <span className="text-slate-400 font-semibold">Email Address</span>
                    <span className="text-slate-300 font-medium">{user.email}</span>
                  </div>
                  {user.companyName && (
                    <div className="flex justify-between border-b border-slate-900 pb-2 text-xs">
                      <span className="text-slate-400 font-semibold">Company Name</span>
                      <span className="text-slate-300">{user.companyName}</span>
                    </div>
                  )}
                  {user.designPurpose && (
                    <div className="flex justify-between border-b border-slate-900 pb-2 text-xs">
                      <span className="text-slate-400 font-semibold">Design Purpose</span>
                      <span className="text-slate-300 font-medium">{user.designPurpose}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-b border-slate-900 pb-2 text-xs">
                    <span className="text-slate-400 font-semibold">Account ID</span>
                    <span className="font-mono text-slate-450 text-[10px]">{user.id}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-semibold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      Member Since
                    </span>
                    <span className="text-slate-355">{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="p-4 border border-brand-500/10 bg-brand-500/5 rounded-xl flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-brand-400 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-brand-300">Identity Verified</h4>
                    <p className="text-[11px] text-slate-400 leading-normal mt-0.5">
                      Your design session is encrypted and synced with our Cloud database. All custom uploaded shapes, assets and canvases are isolated securely.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* BILLING / SUBSCRIPTION TAB */}
            {activeTab === 'billing' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-extrabold text-white">Billing & Plan</h3>
                  <p className="text-slate-400 text-xs mt-1">Manage subscription licenses and downloads limit.</p>
                </div>

                {/* Subscription timer warning bar */}
                <div className="p-4 rounded-xl border flex items-start gap-3 bg-slate-950/40 border-slate-850">
                  {user.isSubscribed ? (
                    <>
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
                        <Check className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-amber-400">Premium Active</h4>
                        <p className="text-[11px] text-slate-400 leading-normal mt-0.5">
                          Paid plan is active. Enjoy unlimited canvas downloads and high-resolution exports.
                        </p>
                      </div>
                    </>
                  ) : trialExpired ? (
                    <>
                      <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/20">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-red-400">Trial Period Expired!</h4>
                        <p className="text-[11px] text-slate-400 leading-normal mt-0.5">
                          Your 1-day free trial has expired. Subscribe to our Premium plan below to unlock exports.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0 border border-brand-500/20">
                        <Calendar className="w-4 h-4 text-brand-400" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-brand-300">1-Day Trial Active</h4>
                        <p className="text-[11px] text-slate-300 mt-1 leading-normal font-semibold">
                          Time remaining: <span className="font-mono text-white bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">{trialTimeRemaining}</span>
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1.5">
                          Free trial unlocks all premium features. Paid checkout is required once this timer finishes.
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Checkout form: Displays only if user is NOT subscribed */}
                {!user.isSubscribed && (
                  <form onSubmit={handleSubscribeSubmit} className="space-y-3 pt-2 border-t border-slate-850">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mb-3">
                      <CreditCard className="w-3.5 h-3.5 text-brand-400" />
                      Upgrade to Premium - $9.99/mo
                    </h4>

                    {payError && (
                      <div className="bg-red-950/40 border border-red-900 text-red-200 text-xs px-3.5 py-2 rounded-lg">
                        {payError}
                      </div>
                    )}
                    {paySuccess && (
                      <div className="bg-emerald-950/40 border border-emerald-900 text-emerald-250 text-xs px-3.5 py-2 rounded-lg">
                        {paySuccess}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="block text-slate-450 text-[10px] uppercase font-bold mb-1">Cardholder Name</label>
                        <input
                          type="text"
                          required
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="John Doe"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-850 text-white rounded outline-none focus:border-brand-500 text-xs"
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <label className="block text-slate-450 text-[10px] uppercase font-bold mb-1">Credit Card Number</label>
                        <input
                          type="text"
                          required
                          maxLength={19}
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="xxxx xxxx xxxx xxxx"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-850 text-white rounded outline-none focus:border-brand-500 text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-450 text-[10px] uppercase font-bold mb-1">Expiry Date</label>
                        <input
                          type="text"
                          required
                          maxLength={5}
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          placeholder="MM/YY"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-850 text-white rounded outline-none focus:border-brand-500 text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-450 text-[10px] uppercase font-bold mb-1">CVV Code</label>
                        <input
                          type="password"
                          required
                          maxLength={3}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="***"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-850 text-white rounded outline-none focus:border-brand-500 text-xs font-mono"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={processing}
                      className="w-full mt-2 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold rounded-lg flex items-center justify-center gap-1.5 transition-all text-xs cursor-pointer shadow-md disabled:opacity-50"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                          Processing Transaction...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 text-slate-950" />
                          Subscribe Now
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* SECURITY TAB (2-FACTOR AUTHENTICATION) */}
            {activeTab === 'security' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-extrabold text-white">Two-Factor Authentication</h3>
                  <p className="text-slate-400 text-xs mt-1">Enhance account security using dynamic TOTP codes.</p>
                </div>

                {secError && (
                  <div className="bg-red-950/40 border border-red-900 text-red-200 text-xs px-3.5 py-2 rounded-lg">
                    {secError}
                  </div>
                )}
                {secSuccess && (
                  <div className="bg-emerald-950/40 border border-emerald-900 text-emerald-250 text-xs px-3.5 py-2 rounded-lg">
                    {secSuccess}
                  </div>
                )}

                {/* Status Indicator */}
                <div className="p-4 rounded-xl border flex items-center justify-between bg-slate-950/40 border-slate-850">
                  <div className="flex items-center gap-2.5">
                    {user.twoFactorEnabled ? (
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <ShieldAlert className="w-5 h-5 text-slate-500" />
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-white">
                        Status: {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {user.twoFactorEnabled ? 'Your account is secured by passcode verification.' : 'Passcode checks are inactive.'}
                      </p>
                    </div>
                  </div>

                  {user.twoFactorEnabled ? (
                    <button
                      onClick={handleDisable2FA}
                      className="px-3.5 py-1.5 bg-red-950/40 hover:bg-red-950 border border-red-900/60 hover:border-red-900 text-red-200 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Disable 2FA
                    </button>
                  ) : (
                    !setupSecret && (
                      <button
                        onClick={handleInit2FA}
                        disabled={loading2fa}
                        className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold shadow-md shadow-brand-500/10 cursor-pointer transition-all"
                      >
                        Enable 2FA
                      </button>
                    )
                  )}
                </div>

                {/* 2FA Setup Form area */}
                {setupSecret && !user.twoFactorEnabled && (
                  <div className="p-5 border border-slate-800 bg-slate-950/60 rounded-xl space-y-4 animate-fadeIn">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-brand-400" />
                      Scan OTP Code QR Code
                    </h4>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-5">
                      <div className="w-36 h-36 bg-white p-2 rounded-lg shrink-0 border border-slate-800">
                        <img src={setupQrCode} alt="OTP QR Code" className="w-full h-full object-contain" />
                      </div>
                      <div className="space-y-2 text-xs">
                        <p className="text-slate-300 leading-normal">
                          Scan the code in your Google Authenticator or Authy app.
                        </p>
                        <p className="text-[11px] text-slate-550">
                          If you cannot scan, manually enter secret: <br />
                          <span className="font-mono text-slate-300 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800 block mt-1 select-all">{setupSecret}</span>
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleVerify2FA} className="pt-3 border-t border-slate-850/80 flex items-end gap-3">
                      <div className="flex-1">
                        <label className="block text-slate-450 text-[10px] uppercase font-bold mb-1">6-Digit Authenticator PIN</label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="e.g. 123456"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-850 text-white rounded outline-none focus:border-brand-500 text-xs font-mono"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading2fa}
                        className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded text-xs transition-colors cursor-pointer"
                      >
                        Verify & Enable
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}

          </div>

          <div className="text-[10px] text-slate-600 border-t border-slate-900 mt-6 pt-3 text-center">
            SaaS Canvas Studio Settings &bull; Session Secured
          </div>
        </main>
      </div>
    </div>
  );
};
