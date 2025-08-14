import { useState, useEffect } from "react";
import { AptosClient } from "aptos";
import { NETWORK, MODULE_ADDRESS } from "../constants";

interface ProfilePageProps {
  isDarkMode: boolean;
  isConnected: boolean;
  walletAddress: string;
  connectbtnfun: () => void;
}

type UserProfile = {
  address: string;
  balance: string;
  balanceInAPT: string;
  hasBalance: boolean;
};

const NODE_URL = `https://fullnode.${NETWORK}.aptoslabs.com/v1`;
const MODULE_NAME = "deadlock";
const FUNCTION_NAME = "get_locked_funds";
const client = new AptosClient(NODE_URL);

export default function ProfilePage({ isDarkMode, isConnected, walletAddress, connectbtnfun }: ProfilePageProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [beneficiaryAddress, setBeneficiaryAddress] = useState("");
  const [transferPercentage, setTransferPercentage] = useState<number>();
  // const [inactivityPeriod, setInactivityPeriod] = useState(0);
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [escrowBalance, setEscrowBalance] = useState<string>("0.00000000");
  const [beneficiaries, setBeneficiaries] = useState<Array<{ address: string; percentage: number }>>([]);
  const [addedAsBeneficiaryBy, setAddedAsBeneficiaryBy] = useState<Array<{ owner: string; percentage: number }>>([]);
  const [loadingAddedBy, setLoadingAddedBy] = useState(false);

  const loadUserProfile = async () => {
    if (!walletAddress) return;
    if (!MODULE_ADDRESS) {
      console.error("MODULE_ADDRESS is not configured. Set VITE_MODULE_ADDRESS in your .env.");
      alert("Contract address not configured. Please set VITE_MODULE_ADDRESS and restart the app.");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::${FUNCTION_NAME}`,
        type_arguments: [],
        arguments: [walletAddress],
      };

      const response = await client.view(payload);
      const balanceValue = response[0].toString();
      const balanceInAPT = (parseInt(balanceValue) / 100000000).toFixed(8);

      // ✅ update escrow balance state here
      setEscrowBalance(balanceInAPT);

      setUserProfile({
        address: walletAddress,
        balance: balanceValue,
        balanceInAPT: balanceInAPT,
        hasBalance: parseInt(balanceValue) > 0
      });
    } catch (error) {
      console.error("Error loading user profile:", error);
      setUserProfile({
        address: walletAddress,
        balance: "0",
        balanceInAPT: "0.00000000",
        hasBalance: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadBeneficiaries = async () => {
    if (!walletAddress || !MODULE_ADDRESS) return;
    try {
      const payload = {
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_beneficiaries`,
        type_arguments: [],
        arguments: [walletAddress],
      };
      const response = await client.view(payload);
      const rawList = (response?.[0] ?? []) as any[];
      const mapped = rawList.map((b: any) => ({
        address: b.addr,
        percentage: typeof b.percentage === "string" ? parseInt(b.percentage) : b.percentage,
      }));
      setBeneficiaries(mapped);
    } catch (e) {
      console.error("Error loading beneficiaries:", e);
      setBeneficiaries([]);
    }
  };

  const loadAddedAsBeneficiaryBy = async () => {
    if (!walletAddress || !MODULE_ADDRESS) return;
    setLoadingAddedBy(true);
    try {
      const payload = {
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_added_as_beneficiary`,
        type_arguments: [],
        arguments: [walletAddress],
      };
      const response = await client.view(payload);
      const rawList = (response?.[0] ?? []) as any[];
      const mapped = rawList.map((e: any) => ({
        owner: e.owner,
        percentage: typeof e.percentage === "string" ? parseInt(e.percentage) : e.percentage,
      }));
      setAddedAsBeneficiaryBy(mapped);
    } catch (e) {
      console.error("Error loading added-as-beneficiary list:", e);
      setAddedAsBeneficiaryBy([]);
    } finally {
      setLoadingAddedBy(false);
    }
  };

  // Load user profile when wallet is connected
  useEffect(() => {
    if (isConnected && walletAddress) {
      loadUserProfile();
      loadBeneficiaries();
      loadAddedAsBeneficiaryBy();
    }
  }, [isConnected, walletAddress]);

  async function ActivateDeadlockfunc() {
    if (!walletAddress) return;
    if (!MODULE_ADDRESS) {
      console.error("MODULE_ADDRESS is not configured. Set VITE_MODULE_ADDRESS in your .env.");
      alert("Contract address not configured. Please set VITE_MODULE_ADDRESS and restart the app.");
      return;
    }
    if (!beneficiaryAddress) {
      alert("Please enter a beneficiary address");
      return;
    }
    if (!transferPercentage || transferPercentage < 1 || transferPercentage > 100) {
      alert("Please enter a valid transfer percentage between 1 and 100");
      return;
    }

    try {
      const payload = {
        type: "entry_function_payload",
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::add_beneficiary`,
        type_arguments: [],
        arguments: [beneficiaryAddress, transferPercentage],
      };

      const response = await (window as any).aptos.signAndSubmitTransaction(payload);
      await client.waitForTransaction(response.hash);
      alert("Beneficiary added successfully");
      await loadBeneficiaries();
    } catch (error: any) {
      console.error("Error adding beneficiary:", error);
      alert(error?.message || "Failed to add beneficiary");
    }
  }

  async function depositToEscrow() {
  if (!walletAddress || !depositAmount) return;
  if (!MODULE_ADDRESS) {
    console.error("MODULE_ADDRESS is not configured. Set VITE_MODULE_ADDRESS in your .env.");
    alert("Contract address not configured. Please set VITE_MODULE_ADDRESS and restart the app.");
    return;
  }

  try {
    // Convert APT to Octas (1 APT = 10^8 Octas)
    const amountInOctas = (depositAmount * 100000000).toString();

    const payload = {
      type: "entry_function_payload",
      function: `${MODULE_ADDRESS}::${MODULE_NAME}::lock_funds`,
      type_arguments: [],
      arguments: [amountInOctas],
    };

    // Assuming you're using the wallet adapter (e.g., Petra / Martian)
    const response = await (window as any).aptos.signAndSubmitTransaction(payload);

    console.log("Transaction submitted:", response.hash);

    // Wait for confirmation
    await client.waitForTransaction(response.hash);

    console.log("Funds locked successfully!");

    // Refresh escrow balance
    await loadUserProfile();
  } catch (error: any) {
    console.error("Error locking funds:", error);
    alert(error?.message || "Failed to lock funds");
  }
}


  return (
    <div className={`min-h-screen transition-all duration-500 ${isDarkMode
      ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900'
      : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      } relative overflow-hidden`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse ${isDarkMode ? 'bg-purple-600' : 'bg-purple-300'
          }`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse ${isDarkMode ? 'bg-yellow-600' : 'bg-yellow-300'
          }`} style={{ animationDelay: '2s' }}></div>
        <div className={`absolute top-40 left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse ${isDarkMode ? 'bg-pink-600' : 'bg-pink-300'
          }`} style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {!isConnected ? (
            <div className={`${isDarkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-lg rounded-3xl shadow-2xl p-8 text-center border ${isDarkMode ? 'border-gray-700' : 'border-white/20'
              } transition-all duration-500`}>
              <div className="animate-bounce mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center">
                  <span className="text-3xl">🔒</span>
                </div>
              </div>
              <h2 className={`text-3xl font-bold mb-4 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                Connect Your Wallet 
              </h2>
              <p className={`mb-8 text-lg transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                Please connect your wallet to configure your dead lock settings.
              </p>
              <button
                onClick={connectbtnfun}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-4 px-8 rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                🔗 Connect Wallet
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Wallet Card */}
              <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-full h-full" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                  }}></div>
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">Dead Lock Wallet</h2>
                      <p className="text-blue-100">Aptos Blockchain</p>
                    </div>
                    <div className="text-right">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <span className="text-2xl">🔒</span>
                      </div>
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
                      <p className="text-blue-100">Loading wallet details...</p>
                    </div>
                  ) : userProfile ? (
                    <div className="space-y-6">
                      {/* Balance Display */}
                      {/* Escrowed Balance */}
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                        <div className="text-center">
                          <p className="text-blue-100 text-sm mb-2">Escrowed in DApp</p>
                          <div className="text-4xl font-bold mb-2">
                            {escrowBalance} <span className="text-2xl">APT</span>
                          </div>
                        </div>
                      </div>

                      {/* Deposit More Form */}
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mt-4">
                        <p className="text-blue-100 text-sm mb-2">Deposit More to Escrow</p>
                        <div className="flex space-x-2">
                          <input
                            type="number"
                            min="0.00000001"
                            step="0.00000001"
                            placeholder="Amount in APT"
                            className="flex-1 px-4 py-2 rounded-lg text-gray-800"
                            onChange={(e) => setDepositAmount(Number(e.target.value))}
                          />
                          <button
                            onClick={depositToEscrow}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                          >
                            Lock
                          </button>
                        </div>
                      </div>


                      {/* Wallet Address */}
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                        <p className="text-blue-100 text-sm mb-2">Wallet Address</p>
                        <div className="flex items-center space-x-3">
                          <div className="flex-1 font-mono text-sm break-all">
                            {userProfile.address}
                          </div>
                          <button
                            onClick={() => navigator.clipboard.writeText(userProfile.address)}
                            className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                            title="Copy address"
                          >
                            📋
                          </button>
                        </div>
                      </div>

                      {/* Status Indicators */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
                          <div className="text-2xl mb-2">🔗</div>
                          <p className="text-blue-100 text-sm">Connection</p>
                          <p className="text-green-300 font-semibold">Active</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
                          <div className="text-2xl mb-2">{userProfile.hasBalance ? '💰' : '💸'}</div>
                          <p className="text-blue-100 text-sm">Balance</p>
                          <p className={`font-semibold ${userProfile.hasBalance ? 'text-green-300' : 'text-yellow-300'}`}>
                            {userProfile.hasBalance ? 'Available' : 'Empty'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-blue-100">Failed to load wallet information.</p>
                      <button
                        onClick={loadUserProfile}
                        className="mt-4 bg-white/20 hover:bg-white/30 px-6 py-2 rounded-xl transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Dead Lock Configuration */}
              <div className={`${isDarkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-lg rounded-3xl shadow-2xl p-8 border ${isDarkMode ? 'border-gray-700' : 'border-white/20'
                } transition-all duration-500`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-2xl font-bold flex items-center transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                    ⚙️ Dead Lock Configuration
                  </h3>
                  <div className={`text-sm transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                    Not configured
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Configuration Status */}
                  <div className={`${isDarkMode ? 'bg-yellow-900/50' : 'bg-yellow-50'} rounded-2xl p-6 border ${isDarkMode ? 'border-yellow-700' : 'border-yellow-200'
                    } transition-all duration-500`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">⚠️</span>
                        </div>
                        <div>
                          <h4 className={`font-semibold transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-800'
                            }`}>Dead Lock Configuration</h4>
                          <p className={`text-sm transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>Set up automatic fund transfer when inactive</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors">
                          30 days Configure period
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Configuration Form Placeholder */}
                  <div className={`${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-2xl p-6 border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'
                    } transition-all duration-500`}>
                    <h4 className={`font-semibold mb-4 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-800'
                      }`}>Dead Lock Settings</h4>
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>Beneficiary Address</label>
                        <input
                          type="text"
                          placeholder="Enter beneficiary wallet address"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 font-mono ${isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'border-gray-300 text-gray-700'
                            }`}
                          onChange={e => setBeneficiaryAddress(e.target.value)} />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>Transfer Percentage (%)</label>
                        <input
                          type="number"
                          placeholder="Enter percentage (1-100)"
                          min="1"
                          max="100"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 ${isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'border-gray-300 text-gray-700'
                            }`}
                          onChange={e => setTransferPercentage(Number(e.target.value))} />
                      </div>
                      {/* <div>
                        <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>Inactivity Period (days)</label>
                        <input 
                          type="number" 
                          placeholder="Enter days of inactivity" 
                          min="1"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'border-gray-300 text-gray-700'
                          }`}
                        />
                      </div> */}
                      <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 px-6 rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg" onClick={ActivateDeadlockfunc}>
                        🔒 Activate Dead Lock
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Beneficiaries */}
              <div className={`${isDarkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-lg rounded-3xl shadow-2xl p-8 border ${isDarkMode ? 'border-gray-700' : 'border-white/20'
                } transition-all duration-500`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-2xl font-bold flex items-center transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                    👥 Beneficiaries
                  </h3>
                  <div className={`text-sm transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                    {beneficiaries.length} total
                  </div>
                </div>

                {beneficiaries.length === 0 ? (
                  <div className={`${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-2xl p-6 border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>No beneficiaries added yet.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {beneficiaries.map((b, idx) => (
                      <div key={`${b.address}-${idx}`} className={`${isDarkMode ? 'bg-white/10' : 'bg-white'} rounded-2xl p-4 border ${isDarkMode ? 'border-white/20' : 'border-gray-200'}`}>
                        <div className="text-sm ${isDarkMode ? 'text-blue-100' : 'text-gray-600'} mb-1">Beneficiary</div>
                        <div className="font-mono break-all mb-2">{b.address}</div>
                        <div className="text-sm ${isDarkMode ? 'text-blue-100' : 'text-gray-600'} mb-1">Assigned Percentage</div>
                        <div className="text-xl font-semibold">{b.percentage}%</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* You are a Beneficiary For */}
              <div className={`${isDarkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-lg rounded-3xl shadow-2xl p-8 border ${isDarkMode ? 'border-gray-700' : 'border-white/20'
                } transition-all duration-500`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-2xl font-bold flex items-center transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                    🧭 You are a beneficiary for
                  </h3>
                  <div className={`text-sm transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                    {loadingAddedBy ? 'Loading...' : `${addedAsBeneficiaryBy.length} owners`}
                  </div>
                </div>

                {loadingAddedBy ? (
                  <div className="text-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current mx-auto"></div>
                  </div>
                ) : addedAsBeneficiaryBy.length === 0 ? (
                  <div className={`${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-2xl p-6 border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>No one has added you as a beneficiary yet.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {addedAsBeneficiaryBy.map((i, idx) => (
                      <div key={`${i.owner}-${idx}`} className={`${isDarkMode ? 'bg-white/10' : 'bg-white'} rounded-2xl p-4 border ${isDarkMode ? 'border-white/20' : 'border-gray-200'}`}>
                        <div className={`text-sm ${isDarkMode ? 'text-blue-100' : 'text-gray-600'} mb-1`}>Owner</div>
                        <div className="font-mono break-all mb-2">{i.owner}</div>
                        <div className={`text-sm ${isDarkMode ? 'text-blue-100' : 'text-gray-600'} mb-1`}>Assigned Percentage</div>
                        <div className="text-xl font-semibold">{i.percentage}%</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className={`${isDarkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-lg rounded-3xl shadow-2xl p-8 border ${isDarkMode ? 'border-gray-700' : 'border-white/20'
                } transition-all duration-500`}>
                <h3 className={`text-2xl font-bold mb-6 flex items-center transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                  ⚡ Quick Actions
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <button
                    onClick={loadUserProfile}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    <div className="text-2xl mb-2">🔄</div>
                    <div className="font-semibold">Refresh</div>
                    <div className="text-sm opacity-90">Update balance</div>
                  </button>

                  <button
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    <div className="text-2xl mb-2">🔍</div>
                    <div className="font-semibold">Check Balance</div>
                    <div className="text-sm opacity-90">Other addresses</div>
                  </button>

                  <button
                    className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-2xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    <div className="text-2xl mb-2">🏠</div>
                    <div className="font-semibold">Home</div>
                    <div className="text-sm opacity-90">Main dashboard</div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
