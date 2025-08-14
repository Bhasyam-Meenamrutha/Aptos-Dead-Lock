interface FooterProps {
  isDarkMode: boolean;
}

export default function Footer({ isDarkMode }: FooterProps) {
  return (
    <footer className={`${isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-white text-gray-600'} border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-6 items-center">
          <div>
            <div className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>🔒 Aptos Dead Lock</div>
            <p className="text-sm mt-2">Secure, non-custodial inheritance and inactivity protection for your Aptos assets.</p>
          </div>
          <div className="text-center">
            <div className="text-sm">Built with ❤️ for the Aptos ecosystem</div>
            <div className="text-xs mt-1 opacity-80">Testnet demo</div>
          </div>
          <div className="md:text-right text-center space-x-4">
            <a className="hover:underline" href="#">Docs</a>
            <a className="hover:underline" href="#">GitHub</a>
            <a className="hover:underline" href="#">Support</a>
          </div>
        </div>
        <div className={`mt-6 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>© {new Date().getFullYear()} Dead Lock. All rights reserved.</div>
      </div>
    </footer>
  );
}


