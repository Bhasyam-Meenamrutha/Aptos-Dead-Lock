import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import BalanceCheckerPage from "./pages/BalanceCheckerPage";
import ProfilePage from "./pages/ProfilePage";

// Add type declarations for window.aptos
declare global {
  interface Window {
    aptos: {
      isConnected: () => Promise<boolean>;
      connect: () => Promise<void>;
      disconnect: () => Promise<void>;
      account: () => Promise<{ address: string }>;
      signAndSubmitTransaction: (transaction: any) => Promise<any>;
    };
  }
}
/**
 * Always prompt wallet connection when connectbtnfun is called.
 * Do not store wallet address in localStorage or elsewhere.
 * Remove auto-connect logic from checkConnectionStatus.
 */
export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Check connection status and theme preference on component mount
  useEffect(() => {
    checkConnectionStatus();
    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(savedTheme === 'dark' || (!savedTheme && prefersDark));
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showUserMenu && !target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const checkConnectionStatus = async () => {
    try {
      const connected = await window.aptos.isConnected();
      setIsConnected(connected);
      if (connected) {
        const accountResponse = await window.aptos.account();
        setWalletAddress(accountResponse.address);
      } else {
        setWalletAddress("");
      }
    } catch (error) {
      console.error("Error checking connection:", error);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const connectbtnfun = async () => {
    try {
      const alreadyConnected = await window.aptos.isConnected();
      if (!alreadyConnected) {
        await window.aptos.connect();
      }
      const accountResponse = await window.aptos.account();
      setWalletAddress(accountResponse.address);
      setIsConnected(true);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const disconnectWallet = async () => {
    try {
      if (typeof window.aptos.disconnect === 'function') {
        await window.aptos.disconnect();
      }
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    } finally {
      setIsConnected(false);
      setWalletAddress("");
      setShowUserMenu(false);
    }
  };

  const copyAddress = async () => {
    if (walletAddress) {
      try {
        await navigator.clipboard.writeText(walletAddress);
        // You could add a toast notification here
        alert("Address copied to clipboard!");
        setShowUserMenu(false);
      } catch (error) {
        console.error("Error copying address:", error);
        alert("Failed to copy address");
      }
    }
  };

  return (
    <Router>
      <div className={isDarkMode ? 'dark' : ''}>
        <Navbar 
          isDarkMode={isDarkMode}
          isConnected={isConnected}
          showUserMenu={showUserMenu}
          setShowUserMenu={setShowUserMenu}
          connectbtnfun={connectbtnfun}
          disconnectWallet={disconnectWallet}
          copyAddress={copyAddress}
          toggleTheme={toggleTheme}
          walletAddress={walletAddress}
        />
        
        <Routes>
          <Route 
            path="/" 
            element={
              <HomePage 
                isDarkMode={isDarkMode}
                isConnected={isConnected}
                connectbtnfun={connectbtnfun}
              />
            } 
          />
          <Route 
            path="/balance-checker" 
            element={<BalanceCheckerPage isDarkMode={isDarkMode} />} 
          />
          <Route 
            path="/profile" 
            element={
              <ProfilePage 
                isDarkMode={isDarkMode}
                isConnected={isConnected}
                walletAddress={walletAddress}
                connectbtnfun={connectbtnfun}
              />
            } 
          />
        </Routes>

        {/* Footer displayed on all pages */}
        <div className="mt-12">
          <Footer isDarkMode={isDarkMode} />
        </div>
      </div>
    </Router>
  );
}
