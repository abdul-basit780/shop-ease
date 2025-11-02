// pages/privacy-policy.js
import { Shield, Eye, Lock, UserCheck, Database, AlertTriangle } from 'lucide-react';

export default function PrivacyPolicy() {
  const sections = [
    {
      icon: Database,
      title: 'Information We Collect',
      content: [
        'Personal information (name, email, address, phone number)',
        'Payment information (processed securely by third-party providers)',
        'Order history and shopping preferences',
        'Device and browser information',
        'Cookies and tracking data for website improvement',
        'Communications between you and our customer service team'
      ]
    },
    {
      icon: Eye,
      title: 'How We Use Your Information',
      content: [
        'Process and fulfill your orders',
        'Communicate about your orders, account, and customer service inquiries',
        'Personalize your shopping experience with AI-powered recommendations',
        'Send marketing communications (with your consent)',
        'Improve our website, products, and services',
        'Detect and prevent fraud and security issues',
        'Comply with legal obligations'
      ]
    },
    {
      icon: UserCheck,
      title: 'Information Sharing',
      content: [
        'We DO NOT sell your personal information to third parties',
        'Shipping carriers (to deliver your orders)',
        'Payment processors (to handle transactions securely)',
        'Service providers who help operate our business',
        'Law enforcement when required by law',
        'Business transfers (merger, acquisition, or sale)'
      ]
    },
    {
      icon: Lock,
      title: 'Data Security',
      content: [
        'Industry-standard SSL encryption for all transactions',
        'PCI DSS compliant payment processing',
        'Regular security audits and updates',
        'Restricted employee access to personal data',
        'Secure data centers with 24/7 monitoring',
        'Multi-factor authentication for account protection'
      ]
    },
    {
      icon: Shield,
      title: 'Your Rights',
      content: [
        'Access your personal data at any time',
        'Request correction of inaccurate information',
        'Delete your account and associated data',
        'Opt-out of marketing communications',
        'Export your data in a portable format',
        'Lodge a complaint with data protection authorities',
        'Withdraw consent for data processing'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl mb-6">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Last updated: October 31, 2024
          </p>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-4">
            At ShopEase, your privacy is paramount. This policy explains how we collect, use, protect, and share your personal information.
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-8 mb-12 border-2 border-primary-200 animate-fade-in animation-delay-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment to You</h2>
          <p className="text-gray-700 leading-relaxed">
            We are committed to protecting your privacy and ensuring the security of your personal information. We only collect data necessary to provide you with the best shopping experience, and we never sell your personal information to third parties.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <div
                key={section.title}
                className="bg-white rounded-2xl p-8 shadow-lg animate-scale-in"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                </div>
                <ul className="space-y-3">
                  {section.content.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start space-x-3">
                      <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-2"></span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Cookies Section */}
        <div className="mt-8 bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies and Tracking</h2>
          <p className="text-gray-700 mb-4">
            We use cookies and similar tracking technologies to improve your browsing experience, analyze site traffic, and personalize content. You can control cookie settings in your browser preferences.
          </p>
          <a href="/cookie-policy" className="text-primary-600 font-semibold hover:underline">
            Learn more in our Cookie Policy →
          </a>
        </div>

        {/* Children's Privacy */}
        <div className="mt-8 bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
          <p className="text-gray-700">
            Our services are not directed to children under 13 years of age. We do not knowingly collect personal information from children. If we discover that a child has provided us with personal information, we will delete it immediately.
          </p>
        </div>

        {/* International Users */}
        <div className="mt-8 bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">International Data Transfers</h2>
          <p className="text-gray-700">
            Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your data in compliance with applicable laws, including GDPR and CCPA.
          </p>
        </div>

        {/* Data Retention */}
        <div className="mt-8 bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Retention</h2>
          <p className="text-gray-700">
            We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, comply with legal obligations, resolve disputes, and enforce our agreements. You may request deletion of your data at any time.
          </p>
        </div>

        {/* Updates to Policy */}
        <div className="mt-8 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-8 border-2 border-orange-200">
          <div className="flex items-start space-x-4">
            <AlertTriangle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Changes to This Policy</h3>
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically.
              </p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-12 bg-gradient-to-br from-primary-600 via-purple-600 to-secondary-600 rounded-3xl p-12 text-white text-center">
          <h2 className="text-3xl font-extrabold mb-4">Questions About Your Privacy?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            If you have any questions or concerns about our privacy practices, please don't hesitate to contact us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact" className="px-8 py-4 bg-white text-primary-600 font-bold rounded-xl hover:shadow-xl transform hover:scale-105 transition-all">
              Contact Us
            </a>
            <a href="mailto:privacy@shopease.com" className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 transition-all border-2 border-white/30">
              Email Privacy Team
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-scale-in { animation: scale-in 0.5s ease-out forwards; opacity: 0; }
        .animation-delay-200 { animation-delay: 0.2s; }
      `}</style>
    </div>
  );
}