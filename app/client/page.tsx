'use client';

import { FloatingClientChat } from '@/components/floating-client-chat';

export default function ClientPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Ecobank Express
        </h1>
        <p className="text-xl text-gray-600">
          Need help? Click the message button in the bottom-right to connect with our support team.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="w-12 h-12 bg-[#004A9F] rounded-lg flex items-center justify-center text-white text-2xl mb-4">
            💬
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Instant Support
          </h3>
          <p className="text-gray-600">
            Chat with our support team in real-time for quick resolutions.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="w-12 h-12 bg-[#004A9F] rounded-lg flex items-center justify-center text-white text-2xl mb-4">
            🔒
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Secure Connection
          </h3>
          <p className="text-gray-600">
            All communications are encrypted and secure. Your data is protected.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="w-12 h-12 bg-[#004A9F] rounded-lg flex items-center justify-center text-white text-2xl mb-4">
            ⚡
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Always Available
          </h3>
          <p className="text-gray-600">
            Get support whenever you need it, even if the app is in the background.
          </p>
        </div>
      </div>

      {/* Section for features */}
      <div className="max-w-4xl mx-auto mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          How It Works
        </h2>
        <div className="bg-white rounded-lg shadow-md p-8">
          <ol className="space-y-4">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-[#004A9F] text-white rounded-full flex items-center justify-center font-semibold">
                1
              </span>
              <div>
                <h4 className="font-semibold text-gray-900">Click the Message Button</h4>
                <p className="text-gray-600 text-sm mt-1">
                  Look for the message icon in the bottom-right corner of your screen.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-[#004A9F] text-white rounded-full flex items-center justify-center font-semibold">
                2
              </span>
              <div>
                <h4 className="font-semibold text-gray-900">Wait for Connection</h4>
                <p className="text-gray-600 text-sm mt-1">
                  The app will establish a secure connection to our support servers.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-[#004A9F] text-white rounded-full flex items-center justify-center font-semibold">
                3
              </span>
              <div>
                <h4 className="font-semibold text-gray-900">Start Chatting</h4>
                <p className="text-gray-600 text-sm mt-1">
                  Type your message and send. A support agent will respond shortly.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-[#004A9F] text-white rounded-full flex items-center justify-center font-semibold">
                4
              </span>
              <div>
                <h4 className="font-semibold text-gray-900">Get Support</h4>
                <p className="text-gray-600 text-sm mt-1">
                  Our team will provide quick and helpful responses to your questions.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </div>

      {/* Floating Chat Component */}
      <FloatingClientChat />
    </div>
  );
}
