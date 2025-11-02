// pages/returns.js
import { RefreshCw, CheckCircle, XCircle, Clock, Package, AlertCircle } from 'lucide-react';

export default function Returns() {
  const returnSteps = [
    {
      step: 1,
      title: 'Initiate Return',
      description: 'Log into your account and go to Order History. Select the item(s) you want to return.',
      icon: Package
    },
    {
      step: 2,
      title: 'Print Label',
      description: 'Receive your prepaid return shipping label via email within 24 hours.',
      icon: CheckCircle
    },
    {
      step: 3,
      title: 'Ship Package',
      description: 'Pack your item securely, attach the label, and drop it off at any shipping location.',
      icon: RefreshCw
    },
    {
      step: 4,
      title: 'Get Refund',
      description: 'Once we receive and inspect your return, we\'ll process your refund within 5-7 business days.',
      icon: CheckCircle
    }
  ];

  const eligibleItems = [
    'Unused items in original packaging',
    'Items with all original tags attached',
    'Items returned within 30 days of delivery',
    'Items in resalable condition',
    'Non-personalized products'
  ];

  const nonEligibleItems = [
    'Personalized or customized items',
    'Items marked as "Final Sale"',
    'Opened beauty or hygiene products',
    'Underwear and swimwear (unless unopened)',
    'Digital products or gift cards',
    'Items damaged due to misuse'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl mb-6">
            <RefreshCw className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">Returns & Refunds</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We want you to love your purchase! If you're not completely satisfied, we're here to help.
          </p>
        </div>

        {/* Return Policy Highlight */}
        <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-3xl p-8 mb-16 border-2 border-primary-200 animate-fade-in animation-delay-200">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <Clock className="h-8 w-8 text-primary-600" />
            <h2 className="text-3xl font-bold text-gray-900">30-Day Return Policy</h2>
          </div>
          <p className="text-center text-gray-700 text-lg">
            You have <span className="font-bold text-primary-600">30 days</span> from the date of delivery to return most items for a full refund or exchange.
          </p>
        </div>

        {/* Return Steps */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How to Return an Item</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {returnSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.step}
                  className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 animate-scale-in"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">{step.step}</span>
                  </div>
                  <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-4 mt-4">
                    <Icon className="h-7 w-7 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Eligible vs Non-Eligible */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Eligible */}
          <div className="bg-white rounded-2xl p-8 shadow-lg animate-fade-in">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Eligible for Return</h3>
            </div>
            <ul className="space-y-3">
              {eligibleItems.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Non-Eligible */}
          <div className="bg-white rounded-2xl p-8 shadow-lg animate-fade-in animation-delay-200">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Not Eligible for Return</h3>
            </div>
            <ul className="space-y-3">
              {nonEligibleItems.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-3">
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Additional Info */}
        <div className="space-y-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Refund Processing</h3>
            <p className="text-gray-700 mb-4">
              Once we receive your return, our team will inspect it within 2-3 business days. If approved, your refund will be processed to your original payment method within 5-7 business days.
            </p>
            <p className="text-gray-700">
              Please note: It may take an additional 3-5 business days for the refund to appear in your account, depending on your financial institution.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Return Shipping Costs</h3>
            <ul className="space-y-2 text-gray-700">
              <li><span className="font-semibold">• Defective or wrong items:</span> We cover all return shipping costs</li>
              <li><span className="font-semibold">• Change of mind:</span> Customer responsible for return shipping (deducted from refund)</li>
              <li><span className="font-semibold">• Premium members:</span> Enjoy free returns on all eligible items!</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-8 border-2 border-orange-200">
            <div className="flex items-start space-x-4">
              <AlertCircle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Important Notes</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Items must be returned in their original condition and packaging</li>
                  <li>• Sale items (over 50% off) are final sale unless defective</li>
                  <li>• Exchanges are available subject to stock availability</li>
                  <li>• International returns may take longer to process</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center bg-gradient-to-br from-primary-600 via-purple-600 to-secondary-600 rounded-3xl p-12 text-white">
          <h2 className="text-3xl font-extrabold mb-4">Need Help with a Return?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Our customer service team is ready to assist you with any questions about returns or refunds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/customer/orders" className="px-8 py-4 bg-white text-primary-600 font-bold rounded-xl hover:shadow-xl transform hover:scale-105 transition-all">
              View My Orders
            </a>
            <a href="/contact" className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 transition-all border-2 border-white/30">
              Contact Support
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