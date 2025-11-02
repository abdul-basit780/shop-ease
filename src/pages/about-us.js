// pages/about-us.js
import Link from 'next/link';
import { ArrowRight, Users, Target, Award, Heart, Zap, Shield } from 'lucide-react';

export default function AboutUs() {
  const values = [
    {
      icon: Heart,
      title: 'Customer First',
      description: 'Your satisfaction is our top priority. We go above and beyond to ensure you have the best shopping experience.',
      color: 'from-red-500 to-pink-500'
    },
    {
      icon: Award,
      title: 'Quality Products',
      description: 'We carefully curate our product selection to ensure you receive only the highest quality items.',
      color: 'from-blue-500 to-purple-500'
    },
    {
      icon: Zap,
      title: 'Fast Delivery',
      description: 'Quick and reliable shipping to get your products to you as fast as possible.',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Shield,
      title: 'Secure Shopping',
      description: 'Your privacy and security are paramount. Shop with confidence knowing your data is protected.',
      color: 'from-green-500 to-teal-500'
    }
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      image: '👩‍💼',
      description: 'Visionary leader with 15+ years in e-commerce'
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      image: '👨‍💻',
      description: 'Tech innovator driving our AI-powered platform'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Customer Experience',
      image: '👩‍🎓',
      description: 'Passionate about creating exceptional customer journeys'
    },
    {
      name: 'David Kim',
      role: 'Head of Operations',
      image: '👨‍🔧',
      description: 'Expert in logistics and supply chain management'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-600 via-purple-600 to-secondary-600 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute w-96 h-96 bg-white rounded-full blur-3xl top-0 -right-48 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-white rounded-full blur-3xl -bottom-48 -left-48 animate-pulse animation-delay-1000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 animate-fade-in">
            About ShopEase
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto animate-fade-in animation-delay-200">
            Revolutionizing online shopping with AI-powered personalization and exceptional customer service
          </p>
        </div>
      </div>

      {/* Our Story */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
              <p>
                Founded in 2020, ShopEase began with a simple mission: to make online shopping smarter, faster, and more personalized for everyone.
              </p>
              <p>
                We recognized that traditional e-commerce was missing something crucial—a personal touch. That's why we developed our AI-powered recommendation engine that learns from your preferences to deliver a truly customized shopping experience.
              </p>
              <p>
                Today, we serve thousands of happy customers worldwide, offering millions of products across hundreds of categories. But our commitment remains the same: putting you first in everything we do.
              </p>
            </div>
          </div>
          <div className="relative animate-fade-in animation-delay-200">
            <div className="aspect-square bg-gradient-to-br from-primary-100 to-secondary-100 rounded-3xl flex items-center justify-center text-9xl">
              🛍️
            </div>
          </div>
        </div>
      </div>

      {/* Our Values */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600">The principles that guide everything we do</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, idx) => {
              const Icon = value.icon;
              return (
                <div 
                  key={value.title}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-scale-in"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${value.color} rounded-xl flex items-center justify-center mb-4 transform group-hover:scale-110 transition-transform`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Our Team */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Meet Our Team</h2>
          <p className="text-xl text-gray-600">The passionate people behind ShopEase</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, idx) => (
            <div 
              key={member.name}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 text-center animate-scale-in"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="text-7xl mb-4">{member.image}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
              <p className="text-primary-600 font-semibold mb-3">{member.role}</p>
              <p className="text-gray-600 text-sm">{member.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-br from-primary-600 via-purple-600 to-secondary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: '10K+', label: 'Happy Customers' },
              { number: '50K+', label: 'Products' },
              { number: '100+', label: 'Categories' },
              { number: '99%', label: 'Satisfaction Rate' }
            ].map((stat, idx) => (
              <div key={stat.label} className="animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="text-5xl font-extrabold mb-2">{stat.number}</div>
                <div className="text-xl text-white/90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-6">Ready to Start Shopping?</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Join thousands of satisfied customers and discover your perfect products today
        </p>
        <Link href="/customer/all-products">
          <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all">
            Start Shopping
            <ArrowRight className="h-5 w-5 ml-2" />
          </button>
        </Link>
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
        .animation-delay-1000 { animation-delay: 1s; }
      `}</style>
    </div>
  );
}