// pages/blog.js
import Link from 'next/link';
import { Calendar, User, ArrowRight, Tag } from 'lucide-react';

export default function Blog() {
  const blogPosts = [
    {
      id: 1,
      title: '10 Tips for Smart Online Shopping',
      excerpt: 'Discover the best practices to save money and make informed purchasing decisions when shopping online.',
      author: 'Sarah Johnson',
      date: '2024-10-28',
      category: 'Shopping Tips',
      image: '🛒',
      readTime: '5 min read'
    },
    {
      id: 2,
      title: 'The Future of E-Commerce: AI and Personalization',
      excerpt: 'Explore how artificial intelligence is revolutionizing the online shopping experience with personalized recommendations.',
      author: 'Michael Chen',
      date: '2024-10-25',
      category: 'Technology',
      image: '🤖',
      readTime: '7 min read'
    },
    {
      id: 3,
      title: 'Sustainable Shopping: Making Eco-Friendly Choices',
      excerpt: 'Learn how to make environmentally conscious decisions while enjoying your online shopping experience.',
      author: 'Emily Rodriguez',
      date: '2024-10-22',
      category: 'Sustainability',
      image: '🌱',
      readTime: '6 min read'
    },
    {
      id: 4,
      title: 'Holiday Shopping Guide 2024',
      excerpt: 'Get ready for the holiday season with our comprehensive guide to finding the perfect gifts for everyone.',
      author: 'David Kim',
      date: '2024-10-20',
      category: 'Guides',
      image: '🎁',
      readTime: '8 min read'
    },
    {
      id: 5,
      title: 'Maximizing Your Rewards and Cashback',
      excerpt: 'Expert tips on how to get the most value from loyalty programs, cashback offers, and shopping rewards.',
      author: 'Sarah Johnson',
      date: '2024-10-18',
      category: 'Savings',
      image: '💰',
      readTime: '5 min read'
    },
    {
      id: 6,
      title: 'Product Review: Top Tech Gadgets of 2024',
      excerpt: 'Our comprehensive review of the must-have tech products that are changing the game this year.',
      author: 'Michael Chen',
      date: '2024-10-15',
      category: 'Reviews',
      image: '📱',
      readTime: '10 min read'
    }
  ];

  const categories = ['All', 'Shopping Tips', 'Technology', 'Sustainability', 'Guides', 'Savings', 'Reviews'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">Our Blog</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tips, trends, and insights to enhance your shopping experience
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12 animate-fade-in animation-delay-200">
          {categories.map((category, idx) => (
            <button
              key={category}
              className={`px-6 py-2 rounded-full font-semibold transition-all transform hover:scale-105 ${
                idx === 0
                  ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Featured Post */}
        <div className="mb-16 animate-fade-in animation-delay-300">
          <div className="bg-gradient-to-br from-primary-600 via-purple-600 to-secondary-600 rounded-3xl overflow-hidden shadow-2xl">
            <div className="grid lg:grid-cols-2 gap-8 p-8 lg:p-12">
              <div className="flex flex-col justify-center text-white">
                <span className="inline-block px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-4 w-fit">
                  Featured Post
                </span>
                <h2 className="text-4xl font-extrabold mb-4">
                  {blogPosts[0].title}
                </h2>
                <p className="text-white/90 text-lg mb-6">
                  {blogPosts[0].excerpt}
                </p>
                <div className="flex items-center space-x-6 text-white/80 mb-8">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{blogPosts[0].author}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(blogPosts[0].date).toLocaleDateString()}</span>
                  </div>
                </div>
                <Link href={`#`}>
                  <button className="inline-flex items-center px-6 py-3 bg-white text-primary-600 font-bold rounded-xl hover:shadow-xl transform hover:scale-105 transition-all w-fit">
                    Read More
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </button>
                </Link>
              </div>
              <div className="flex items-center justify-center text-9xl">
                {blogPosts[0].image}
              </div>
            </div>
          </div>
        </div>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.slice(1).map((post, idx) => (
            <div
              key={post.id}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden animate-scale-in"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="aspect-video bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center text-7xl group-hover:scale-110 transition-transform duration-700">
                {post.image}
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-600 rounded-full text-xs font-semibold">
                    <Tag className="h-3 w-3 mr-1" />
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-500">{post.readTime}</span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
                  {post.title}
                </h3>

                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <User className="h-4 w-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>

                <Link href={`#`}>
                  <button className="w-full mt-4 px-4 py-2 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center group">
                    Read Article
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Newsletter CTA */}
        <div className="mt-20 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-3xl p-12 text-center border-2 border-primary-200 animate-fade-in">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            Never Miss an Update
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and get the latest shopping tips, product reviews, and exclusive deals delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary-500"
            />
            <button className="px-8 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold rounded-xl hover:shadow-xl transition-all">
              Subscribe
            </button>
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