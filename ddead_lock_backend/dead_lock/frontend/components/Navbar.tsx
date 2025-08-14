import { useNavigate, useLocation } from "react-router-dom";

interface NavbarProps {
  isDarkMode: boolean;
  isConnected: boolean;
  showUserMenu: boolean;
  setShowUserMenu: (show: boolean) => void;
  connectbtnfun: () => void;
  disconnectWallet: () => void;
  copyAddress: () => void;
  toggleTheme: () => void;
  walletAddress: string;
}

export default function Navbar({ 
  isDarkMode, 
  isConnected, 
  showUserMenu, 
  setShowUserMenu, 
  connectbtnfun, 
  disconnectWallet, 
  copyAddress, 
  toggleTheme, 
  walletAddress 
}: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className={`sticky top-0 z-40 bg-white/70 supports-[backdrop-filter]:bg-white/60 backdrop-blur-xl border-b border-gray-200 text-gray-800 shadow-lg transition-all duration-500`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold">🔒 Aptos Dead Lock</h1>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => navigate('/')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                isActive('/')
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              🏠 Home
            </button>
            
            <button
              onClick={() => navigate('/balance-checker')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                isActive('/balance-checker')
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              🔍 Check Balance
            </button>
            
            <button
              onClick={() => navigate('/profile')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                isActive('/profile')
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              👤 Profile
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all duration-300 hover:bg-gray-100 text-gray-700`}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            
            {!isConnected ? (
              <button 
                onClick={connectbtnfun}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 shadow-md"
              >
                🔗 Connect Wallet
              </button>
            ) : (
              <div className="relative user-menu-container">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300"
                >
                  <span className="text-emerald-600">Connected</span>
                  <svg className={`w-4 h-4 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl z-50 border border-gray-200 overflow-hidden">
                    <div className="py-2">
                      {/* Wallet Address Display */}
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Wallet Address</p>
                        <p className="text-sm font-mono text-gray-700 truncate">
                          {walletAddress}
                        </p>
                      </div>
                      
                      {/* Copy Address Option */}
                      <button 
                        onClick={copyAddress}
                        className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                        Copy Address
                      </button>
                      
                      {/* Disconnect Option */}
                      <button 
                        onClick={disconnectWallet}
                        className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                        </svg>
                        Disconnect Wallet
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Subtle animated bottom bar */}
      <div className="h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 opacity-60"></div>
    </nav>
  );
}
