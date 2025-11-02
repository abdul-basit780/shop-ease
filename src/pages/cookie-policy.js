// pages/cookie-policy.js
import { Cookie, Settings, Eye, BarChart, Shield } from 'lucide-react';

export default function CookiePolicy() {
  const cookieTypes = [
    {
      icon: Shield,
      title: 'Essential Cookies',
      color: 'from-green-500 to-green-600',
      description: 'Required for the website to function properly. These cannot be disabled.',
      examples: [
        'Authentication and session management',
        'Shopping cart functionality',
        'Security and fraud prevention',
        'Load balancing and performance'
      ]
    },
    {
      icon: Settings,
      title: 'Functional Cookies',
      color: 'from-blue-500 to-blue-600',
      description: 'Remember your preferences and choices to enhance your experience.',
      examples: [
        'Language and region preferences',
        'Display settings and theme',
        'Recently viewed products',
        'Saved filters and search preferences'
      ]
    },
    {
      icon: BarChart,
      title: 'Analytics Cookies',
      color: 'from-purple-500 to-purple-600',
      description: 'Help us understand how visitors use our website to improve our services.',
      examples: [
        'Page views and navigation patterns',
        'Time spent on pages',
        'Click behavior and interactions',
        'Error tracking and diagnostics'
      ]
    },
    {
      icon: Eye,
      title: 'Marketing Cookies',
      color: 'from-pink-500 to-pink-600',
      description: 'Track your browsing to show relevant advertisements and measure campaign effectiveness.',
      examples: [
        'Personalized product recommendations',
        'Targeted advertising',
        'Social media integration',
        'Retargeting campaigns'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl mb-6">
            <Cookie className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">Cookie Policy</h1>
          <p className="text-lg text-gray-600">
            Last updated: October 31, 2024
          </p>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-4">
            Learn about how ShopEase uses cookies and similar technologies to enhance your shopping experience.
          </p>
        </div>

        {/* What are Cookies */}
        <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-8 mb-12 border-2 border-primary-200 animate-fade-in animation-delay-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Cookies are small text files that are stored on your device when you visit a website. They help websites remember your preferences, recognize you on return visits, and improve your overall experience.
          </p>
          <p className="text-gray-700 leading-relaxed">
            We use both first-party cookies (set by ShopEase) and third-party cookies (set by our partners) to provide and improve our services.
          </p>
        </div>

        {/* Types of Cookies */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Types of Cookies We Use</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {cookieTypes.map((type, idx) => {
              const Icon = type.icon;
              return (
                <div
                  key={type.title}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 animate-scale-in"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${type.color} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{type.title}</h3>
                  <p className="text-gray-600 mb-4">{type.description}</p>
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Examples:</p>
                    <ul className="space-y-1">
                      {type.examples.map((example, exIdx) => (
                        <li key={exIdx} className="text-sm text-gray-600 flex items-start">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0 mt-1.5 mr-2"></span>
                          <span>{example}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Third-Party Cookies */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Cookies</h2>
          <p className="text-gray-700 mb-4">
            We work with trusted partners who may set cookies on our website. These include:
          </p>
          <ul className="space-y-3 text-gray-700">
            <li><span className="font-semibold">Google Analytics:</span> For website analytics and performance tracking</li>
            <li><span className="font-semibold">Facebook Pixel:</span> For targeted advertising and conversion tracking</li>
            <li><span className="font-semibold">Payment Processors:</span> For secure transaction processing</li>
            <li><span className="font-semibold">CDN Providers:</span> For faster content delivery and performance</li>
            <li><span className="font-semibold">Customer Support Tools:</span> For live chat and support services</li>
          </ul>
        </div>

        {/* Managing Cookies */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Managing Your Cookie Preferences</h2>
          <p className="text-gray-700 mb-4">
            You have control over the cookies we use. Here's how to manage them:
          </p>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-bold text-gray-900 mb-2">Browser Settings</h3>
              <p className="text-gray-700">
                Most browsers allow you to refuse or delete cookies. Check your browser's help menu for instructions. Note that blocking essential cookies may affect website functionality.
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-bold text-gray-900 mb-2">Cookie Preference Center</h3>
              <p className="text-gray-700 mb-3">
                Use our Cookie Preference Center to customize which types of cookies you allow.
              </p>
              <button className="px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all">
                Manage Cookie Preferences
              </button>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-bold text-gray-900 mb-2">Opt-Out Tools</h3>
              <p className="text-gray-700">
                You can opt out of interest-based advertising through industry opt-out platforms:
              </p>
              <ul className="mt-2 space-y-1">
                <li className="text-primary-600 hover:underline">
                  <a href="http://optout.aboutads.info" target="_blank" rel="noopener noreferrer">• Digital Advertising Alliance</a>
                </li>
                <li className="text-primary-600 hover:underline">
                  <a href="http://optout.networkadvertising.org" target="_blank" rel="noopener noreferrer">• Network Advertising Initiative</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Cookie Lifespan */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookie Lifespan</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Session Cookies</h3>
              <p className="text-gray-700">
                These temporary cookies are deleted when you close your browser. They help maintain your session as you navigate our website.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Persistent Cookies</h3>
              <p className="text-gray-700">
                These cookies remain on your device for a set period (from a few days to several years) and activate each time you visit our website. They help us remember your preferences and provide personalized experiences.
              </p>
            </div>
          </div>
        </div>

        {/* Do Not Track */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Do Not Track Signals</h2>
          <p className="text-gray-700">
            Some browsers have a "Do Not Track" feature that lets you tell websites not to track you. Currently, there is no industry standard for how to respond to these signals. We do not currently respond to "Do Not Track" browser signals, but you can still manage your cookie preferences through your browser settings or our Cookie Preference Center.
          </p>
        </div>

        {/* Updates to Policy */}
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-8 border-2 border-orange-200 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Updates to This Policy</h2>
          <p className="text-gray-700">
            We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. Please check this page periodically for updates.
          </p>
        </div>

        {/* Contact */}
        <div className="bg-gradient-to-br from-primary-600 via-purple-600 to-secondary-600 rounded-3xl p-12 text-white text-center">
          <h2 className="text-3xl font-extrabold mb-4">Questions About Cookies?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            If you have any questions about our use of cookies, please feel free to contact us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact" className="px-8 py-4 bg-white text-primary-600 font-bold rounded-xl hover:shadow-xl transform hover:scale-105 transition-all">
              Contact Us
            </a>
            <a href="/privacy-policy" className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 transition-all border-2 border-white/30">
              View Privacy Policy
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