// pages/faq.js
import { useState } from 'react';
import { ChevronDown, Search, HelpCircle, Package, CreditCard, Truck, RefreshCw } from 'lucide-react';

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openIndex, setOpenIndex] = useState(null);

  const categories = [
    { id: 'all', name: 'All Questions', icon: HelpCircle },
    { id: 'orders', name: 'Orders', icon: Package },
    { id: 'payment', name: 'Payment', icon: CreditCard },
    { id: 'shipping', name: 'Shipping', icon: Truck },
    { id: 'returns', name: 'Returns', icon: RefreshCw }
  ];

  const faqs = [
    {
      category: 'orders',
      question: 'How do I place an order?',
      answer: 'To place an order, browse our products, add items to your cart, and proceed to checkout. You\'ll need to provide shipping information and payment details. Once confirmed, you\'ll receive an order confirmation email.'
    },
    {
      category: 'orders',
      question: 'Can I modify or cancel my order?',
      answer: 'You can modify or cancel your order within 1 hour of placing it. Go to "My Orders" in your account, find the order, and select "Modify" or "Cancel". After this window, please contact customer support for assistance.'
    },
    {
      category: 'orders',
      question: 'How can I track my order?',
      answer: 'Once your order ships, you\'ll receive a tracking number via email. You can also track your order by logging into your account and visiting the "Order History" page where you\'ll find real-time tracking information.'
    },
    {
      category: 'payment',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), debit cards, PayPal, Apple Pay, and Google Pay. All transactions are secured with SSL encryption for your safety.'
    },
    {
      category: 'payment',
      question: 'Is my payment information secure?',
      answer: 'Yes! We use industry-standard SSL encryption and PCI DSS compliant payment processors. We never store your complete credit card information on our servers. All payment data is securely handled by our trusted payment partners.'
    },
    {
      category: 'payment',
      question: 'Do you offer installment payments?',
      answer: 'Yes, we partner with several buy-now-pay-later services for orders over $50. You can choose from options like Affirm, Klarna, or Afterpay at checkout to split your payment into interest-free installments.'
    },
    {
      category: 'shipping',
      question: 'What are your shipping options?',
      answer: 'We offer Standard Shipping (5-7 business days), Express Shipping (2-3 business days), and Next Day Delivery (order by 2 PM). Shipping costs vary based on your location and chosen method. Free standard shipping on orders over $50!'
    },
    {
      category: 'shipping',
      question: 'Do you ship internationally?',
      answer: 'Yes, we ship to over 100 countries worldwide! International shipping times vary by destination, typically 7-21 business days. Customs fees and import duties may apply and are the responsibility of the customer.'
    },
    {
      category: 'shipping',
      question: 'What if my package is lost or damaged?',
      answer: 'If your package is lost during transit or arrives damaged, please contact us within 48 hours with photos (if damaged). We\'ll file a claim with the carrier and either send a replacement or issue a full refund.'
    },
    {
      category: 'returns',
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for most items. Products must be unused, in original packaging with all tags attached. Electronics and personalized items have specific return conditions. Refunds are processed within 5-7 business days.'
    },
    {
      category: 'returns',
      question: 'How do I initiate a return?',
      answer: 'Log into your account, go to "Order History", select the order, and click "Return Items". Follow the prompts to select items and reason for return. You\'ll receive a prepaid return label via email within 24 hours.'
    },
    {
      category: 'returns',
      question: 'Who pays for return shipping?',
      answer: 'For defective or incorrect items, we cover return shipping costs. For buyer\'s remorse or size/color changes, customers are responsible for return shipping unless you have our Premium membership (free returns on all eligible items).'
    }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl mb-6">
            <HelpCircle className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about shopping, orders, shipping, and more
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12 animate-fade-in animation-delay-200">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 text-lg"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12 animate-fade-in animation-delay-300">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                  activeCategory === category.id
                    ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>

        {/* FAQ List */}
        <div className="max-w-4xl mx-auto space-y-4">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 animate-scale-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 rounded-2xl transition-colors"
                >
                  <span className="text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-6 w-6 text-primary-600 flex-shrink-0 transition-transform duration-300 ${
                      openIndex === index ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === index ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600">Try adjusting your search or category filter</p>
            </div>
          )}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-3xl p-12 text-center border-2 border-primary-200 animate-fade-in">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            Still have questions?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Can't find the answer you're looking for? Our customer support team is here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact" className="px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold rounded-xl hover:shadow-xl transform hover:scale-105 transition-all">
              Contact Support
            </a>
            <a href="mailto:support@shopease.com" className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 border-2 border-gray-200 transition-all">
              Email Us
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
        .animation-delay-300 { animation-delay: 0.3s; }
      `}</style>
    </div>
  );
}