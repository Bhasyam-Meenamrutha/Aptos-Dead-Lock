import { useNavigate } from "react-router-dom";

interface HomePageProps {
  isDarkMode: boolean;
  isConnected: boolean;
  connectbtnfun: () => void;
}

export default function HomePage({ isDarkMode, isConnected, connectbtnfun }: HomePageProps) {
  const navigate = useNavigate();
  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    } relative overflow-hidden`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse ${
          isDarkMode ? 'bg-purple-600' : 'bg-purple-300'
        }`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse ${
          isDarkMode ? 'bg-yellow-600' : 'bg-yellow-300'
        }`} style={{animationDelay: '2s'}}></div>
        <div className={`absolute top-40 left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse ${
          isDarkMode ? 'bg-pink-600' : 'bg-pink-300'
        }`} style={{animationDelay: '4s'}}></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="text-center mb-12">
          <h1 className={`text-4xl font-bold mb-4 transition-colors duration-500 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            🔒 Welcome to Aptos Dead Lock
          </h1>
          <p className={`text-lg mb-8 transition-colors duration-500 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Secure your funds with automatic transfer when you become inactive
          </p>
          
          <div className="relative max-w-3xl mx-auto">
            <div className={`absolute -inset-0.5 rounded-3xl ${isDarkMode ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-600' : 'bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400'} opacity-60 blur-lg animate-pulse`}></div>
            <div className={`${isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-white/40'} relative rounded-3xl border backdrop-blur-xl shadow-2xl p-10`}> 
              {!isConnected ? (
                <div className="text-center">
                  <div className="mb-6 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-2xl">🔒</span>
                    </div>
                  </div>
                  <h2 className={`text-3xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Set Up Dead Lock</h2>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
                    Connect your wallet to configure automatic fund transfers in case of inactivity.
                  </p>
                  <button 
                    onClick={connectbtnfun}
                    className="inline-flex items-center justify-center bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 px-8 rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg"
                  >
                    🔗 Connect Wallet
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <h2 className={`text-3xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>You're connected</h2>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
                    Access the sections you need from the navigation. Your experience is now personalized.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button onClick={() => navigate('/profile')} className={`${isDarkMode ? 'border-gray-600 text-gray-200 hover:bg-gray-700/60' : 'border-gray-300 text-gray-700 hover:bg-gray-100'} border px-5 py-2 rounded-xl transition-colors`}>
                      Go to Profile
                    </button>
                    <button onClick={() => navigate('/balance-checker')} className={`${isDarkMode ? 'border-gray-600 text-gray-200 hover:bg-gray-700/60' : 'border-gray-300 text-gray-700 hover:bg-gray-100'} border px-5 py-2 rounded-xl transition-colors`}>
                      Check Balance
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* About Section */}
        <section className={`mt-16 max-w-5xl mx-auto ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>About Dead Lock</h2>
          <p className="leading-7">
            Dead Lock is a self-custody safety net on the Aptos blockchain. It lets you lock funds in an escrow and set
            beneficiaries with percentages. If you become inactive, your funds can be automatically transferred to your
            designated beneficiaries, ensuring assets are never stranded.
          </p>
          <div className={`mt-6 ${isDarkMode ? 'bg-gray-800/70 border-gray-700' : 'bg-white/80 border-white/40'} rounded-2xl border p-6 backdrop-blur`}> 
            <ul className="list-disc pl-6 space-y-2">
              <li>Non-custodial design leveraging Move smart contracts</li>
              <li>Escrow balance visibility and deposits in APT</li>
              <li>Configurable beneficiaries and allocation percentages</li>
            </ul>
          </div>
        </section>

        {/* Future Scope Section */}
        <section className={`mt-12 max-w-5xl mx-auto ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Future Scope</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800/70 border-gray-700' : 'bg-white/80 border-white/40'} rounded-2xl border p-6 backdrop-blur`}>
              <h3 className="text-xl font-semibold mb-2">Multi-asset Support</h3>
              <p>Support for additional tokens and NFTs locked and distributed via the same policy.</p>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800/70 border-gray-700' : 'bg-white/80 border-white/40'} rounded-2xl border p-6 backdrop-blur`}>
              <h3 className="text-xl font-semibold mb-2">Inactivity Oracles</h3>
              <p>Flexible inactivity proofs (on-chain heartbeats, delegated guardians, oracles).</p>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800/70 border-gray-700' : 'bg-white/80 border-white/40'} rounded-2xl border p-6 backdrop-blur`}>
              <h3 className="text-xl font-semibold mb-2">Recovery UX</h3>
              <p>Guided flows for updating beneficiaries and emergency unlocks with safeguards.</p>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800/70 border-gray-700' : 'bg-white/80 border-white/40'} rounded-2xl border p-6 backdrop-blur`}>
              <h3 className="text-xl font-semibold mb-2">Audits & Tooling</h3>
              <p>Formal verification, audits, and analytics dashboards for transparency.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
