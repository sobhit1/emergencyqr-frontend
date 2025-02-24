import React, { useState, useEffect } from "react";
import { userStore } from "../utils/userStore";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [qrData, setQrData] = useState(null);
  const [contacts, setContacts] = useState([{ name: "", phone: "" }]);
  const { user, setUser } = userStore();

  
  useEffect(() => {
    const fetchQrData = async () => {
      try {
        console.log(user)
        const hasQrCode = user?.qrCode;
        
        if (hasQrCode) {
          
          setQrData({
            id: user._id,
            bloodType: user.bloodType,
            medicalHistory: user.medicalHistory,
            emergencyContacts: user.emergencyContacts,
            qrCodeUrl: user.qrCode
            
          });
        }
        
        setLoading(false);
      } catch (err) {
        setError("Failed to load your information. Please try again.");
        setLoading(false);
      }
    };

  
    setTimeout(fetchQrData, 1000);
  }, []);

  const handleAddContact = () => {
    setContacts([...contacts, { name: "", phone: "" }]);
  };

  const handleRemoveContact = (index) => {
    const newContacts = [...contacts];
    newContacts.splice(index, 1);
    setContacts(newContacts);
  };

  const handleContactChange = (index, field, value) => {
    const newContacts = [...contacts];
    newContacts[index][field] = value;
    setContacts(newContacts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    console.log("submitting");

    const bloodType = e.target.bloodType.value;
    const medicalHistory = e.target.medicalHistory.value;
    
    const validContacts = contacts.filter(contact => contact.name.trim() && contact.phone.trim());
    if (validContacts.length === 0) {
      setError("Please add at least one emergency contact");
      return;
    }

    setSubmitting(true);
    try {
        console.log("fetching");
        const token = localStorage.getItem('authToken');
        console.log("authHeader: ", token); 
        const res = await fetch("https://emergencyqr.vercel.app/api/auth/update", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization":  `Bearer ${token}`,
            },
            body: JSON.stringify({
              bloodType,
              medicalHistory,
              emergencyContacts: validContacts,
            }),
        });
            const data = await res.json();
            console.log(data)
            const qr = await fetch("https://emergencyqr.vercel.app/api/qr/generate", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization":  `Bearer ${token}`,
                },
                });
                const qrData = await qr.json();
                console.log(qrData);
                const updatedUser = { ...data.user, qrCode: qrData.qrCode };
                setUser(updatedUser);
                console.log("Updated user:", updatedUser);
                console.log(user);

      
      setTimeout(() => {
        
        setSuccess("QR code generated successfully!");
        setSubmitting(false);
      }, 1500);
      window.location.reload();
    } catch (err) {
      setError("Failed to generate QR code. Please try again.");
      setSubmitting(false);
    }
  };

  const handleEdit = () => {
    if (qrData) {
      setContacts(qrData.emergencyContacts);
    }
    setQrData(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 text-center">
          <div className="flex justify-center mb-4">
            <svg className="animate-spin h-10 w-10 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Loading your dashboard...</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Please wait while we retrieve your information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden mb-6">
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Emergency QR Dashboard</h1>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
              </div>
            </div>
            
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-400">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 dark:text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-700 dark:text-red-300 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 dark:border-green-400">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 dark:text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-green-700 dark:text-green-300 text-sm font-medium">{success}</p>
                </div>
              </div>
            )}

            {qrData ? (
              <div>
                <div className="flex flex-col md:flex-row gap-8 mb-6">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Your Emergency Information</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Blood Type</p>
                        <p className="text-lg font-medium text-gray-800 dark:text-white">{qrData.bloodType}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Medical History</p>
                        <p className="text-lg font-medium text-gray-800 dark:text-white">{qrData.medicalHistory || "None"}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Emergency Contacts</p>
                        <ul className="mt-1 space-y-2">
                          {qrData.emergencyContacts.map((contact, index) => (
                            <li key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                              <p className="font-medium text-gray-800 dark:text-white">{contact.name}</p>
                              <p className="text-gray-600 dark:text-gray-300">{contact.phone}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="bg-white p-3 rounded-lg shadow-md mb-3">
                      <img 
                        src={qrData.qrCodeUrl} 
                        alt="Emergency QR Code" 
                        className="w-48 h-48"
                      />
                    </div>
                    <button 
                      onClick={() => { /* Download logic */ }}
                      className="mb-2 flex items-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download QR
                    </button>
                    <button 
                      onClick={() => { navigator.clipboard.writeText(`https://emergencyqr-frontend.vercel.app/profile/${qrData.id}`); setSuccess("QR URL copied to clipboard!"); }}
                      className="flex items-center py-2 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-medium transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copy URL
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <button 
                    onClick={handleEdit}
                    className="flex items-center py-2 px-6 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-medium transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Information
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="mb-6 text-gray-600 dark:text-gray-300">
                  Please provide your emergency medical information to generate your QR code. This information will be accessible when someone scans your QR code in case of emergency.
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Blood Type *</label>
                      <select
                        id="bloodType"
                        name="bloodType"
                        required
                        className="w-full py-3 px-4 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 outline-none transition-all"
                      >
                        <option value="">Select blood type</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Medical History *</label>
                      <input
                        type="text"
                        id="medicalHistory"
                        name="medicalHistory"
                        placeholder="E.g., Diabetes, Asthma, None"
                        required
                        className="w-full py-3 px-4 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Emergency Contacts *</label>
                      <button
                        type="button"
                        onClick={handleAddContact}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Contact
                      </button>
                    </div>
                    
                    {contacts.map((contact, index) => (
                      <div key={index} className="mb-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Contact {index + 1}</h4>
                          {contacts.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveContact(index)}
                              className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor={`contact-name-${index}`} className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Name</label>
                            <input
                              type="text"
                              id={`contact-name-${index}`}
                              value={contact.name}
                              onChange={(e) => handleContactChange(index, "name", e.target.value)}
                              placeholder="Full Name"
                              required
                              className="w-full py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label htmlFor={`contact-phone-${index}`} className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Phone</label>
                            <input
                              type="tel"
                              id={`contact-phone-${index}`}
                              value={contact.phone}
                              onChange={(e) => handleContactChange(index, "phone", e.target.value)}
                              placeholder="+919876543210"
                              required
                              className="w-full py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 outline-none transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex justify-center items-center py-3 px-4 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all disabled:opacity-70"
                  >
                    {submitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating QR Code...
                      </span>
                    ) : (
                      "Generate Emergency QR Code"
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
        
        <div className="text-center">
          <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm">
            Need help? Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}