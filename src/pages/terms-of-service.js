// pages/terms-of-service.js
import { FileText, CheckCircle, AlertCircle, Scale } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl mb-6">
            <FileText className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-lg text-gray-600">
            Last updated: October 31, 2024
          </p>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-4">
            Please read these terms carefully before using ShopEase services.
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-8 mb-12 border-2 border-primary-200 animate-fade-in animation-delay-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Agreement to Terms</h2>
          <p className="text-gray-700 leading-relaxed">
            By accessing or using ShopEase, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using our services.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {/* Account Registration */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Account Registration</h2>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li>• You must be at least 18 years old to create an account</li>
              <li>• You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>• You must provide accurate, current, and complete information</li>
              <li>• You are responsible for all activities that occur under your account</li>
              <li>• We reserve the right to suspend or terminate accounts that violate these terms</li>
            </ul>
          </div>

          {/* Product Information */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Scale className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Product Information & Pricing</h2>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li>• We strive to display accurate product information, but cannot guarantee error-free content</li>
              <li>• Product colors may vary slightly due to screen display settings</li>
              <li>• Prices are subject to change without notice</li>
              <li>• We reserve the right to limit quantities or refuse orders</li>
              <li>• Promotions and discounts are subject to specific terms and conditions</li>
              <li>• We are not responsible for typographical errors in pricing</li>
            </ul>
          </div>

          {/* Orders & Payment */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Orders & Payment</h2>
            <ul className="space-y-3 text-gray-700">
              <li>• All orders are subject to acceptance and availability</li>
              <li>• Payment must be received before order fulfillment</li>
              <li>• We accept major credit cards, debit cards, and other listed payment methods</li>
              <li>• You authorize us to charge the provided payment method for all purchases</li>
              <li>• Failed or declined payments may result in order cancellation</li>
              <li>• Gift cards and promotional codes have specific terms and expiration dates</li>
            </ul>
          </div>

          {/* Shipping & Delivery */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Shipping & Delivery</h2>
            <ul className="space-y-3 text-gray-700">
              <li>• Shipping times are estimates and not guaranteed</li>
              <li>• Risk of loss transfers to you upon delivery to the carrier</li>
              <li>• You are responsible for providing accurate shipping information</li>
              <li>• International shipments may be subject to customs duties and taxes</li>
              <li>• We are not responsible for delays caused by shipping carriers or customs</li>
            </ul>
          </div>

          {/* Returns & Refunds */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Returns & Refunds</h2>
            <ul className="space-y-3 text-gray-700">
              <li>• Returns are subject to our Return Policy (30-day window for most items)</li>
              <li>• Items must be in original condition with tags attached</li>
              <li>• Refunds are processed to the original payment method</li>
              <li>• Shipping costs are non-refundable unless the return is due to our error</li>
              <li>• Some items are marked as final sale and cannot be returned</li>
            </ul>
            <a href="/returns" className="text-primary-600 font-semibold hover:underline mt-4 inline-block">
              View Full Return Policy →
            </a>
          </div>

          {/* Intellectual Property */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Intellectual Property</h2>
            <ul className="space-y-3 text-gray-700">
              <li>• All content on ShopEase is protected by copyright, trademark, and other laws</li>
              <li>• You may not reproduce, distribute, or create derivative works without permission</li>
              <li>• Product images and descriptions are for reference only</li>
              <li>• ShopEase and its logo are registered trademarks</li>
              <li>• User-generated content remains your property but you grant us a license to use it</li>
            </ul>
          </div>

          {/* Prohibited Activities */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Prohibited Activities</h2>
            <p className="text-gray-700 mb-4">You agree not to:</p>
            <ul className="space-y-3 text-gray-700">
              <li>• Use our services for any illegal purpose</li>
              <li>• Violate any applicable laws or regulations</li>
              <li>• Infringe on the rights of others</li>
              <li>• Transmit viruses, malware, or harmful code</li>
              <li>• Attempt to gain unauthorized access to our systems</li>
              <li>• Engage in fraudulent activities or misrepresent your identity</li>
              <li>• Harass, abuse, or harm other users</li>
              <li>• Use automated systems to access our services (bots, scrapers, etc.)</li>
            </ul>
          </div>

          {/* Limitation of Liability */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
            <p className="text-gray-700">
              To the maximum extent permitted by law, ShopEase shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or use, arising from your use of our services, even if we have been advised of the possibility of such damages. Our total liability shall not exceed the amount you paid for the product or service in question.
            </p>
          </div>

          {/* Indemnification */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Indemnification</h2>
            <p className="text-gray-700">
              You agree to indemnify and hold harmless ShopEase, its affiliates, officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of our services, violation of these terms, or infringement of any rights of another party.
            </p>
          </div>

          {/* Dispute Resolution */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Dispute Resolution</h2>
            <ul className="space-y-3 text-gray-700">
              <li>• Any disputes shall be resolved through binding arbitration</li>
              <li>• You waive the right to participate in class action lawsuits</li>
              <li>• Arbitration shall be conducted under the rules of the American Arbitration Association</li>
              <li>• The arbitrator's decision shall be final and binding</li>
              <li>• Each party shall bear its own costs and expenses</li>
            </ul>
          </div>

          {/* Governing Law */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Governing Law</h2>
            <p className="text-gray-700">
              These Terms shall be governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions. Any legal action or proceeding arising under these Terms shall be brought exclusively in the courts of California.
            </p>
          </div>

          {/* Changes to Terms */}
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-8 border-2 border-orange-200">
            <div className="flex items-start space-x-4">
              <AlertCircle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Changes to Terms</h3>
                <p className="text-gray-700">
                  We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting. Your continued use of our services after changes constitutes acceptance of the modified Terms. We encourage you to review these Terms periodically.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-12 bg-gradient-to-br from-primary-600 via-purple-600 to-secondary-600 rounded-3xl p-12 text-white text-center">
          <h2 className="text-3xl font-extrabold mb-4">Questions About These Terms?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            If you have any questions or concerns about our Terms of Service, please contact us.
          </p>
          <a href="/contact" className="inline-flex px-8 py-4 bg-white text-primary-600 font-bold rounded-xl hover:shadow-xl transform hover:scale-105 transition-all">
            Contact Us
          </a>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animation-delay-200 { animation-delay: 0.2s; }
      `}</style>
    </div>
  );
}