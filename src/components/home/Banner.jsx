import Link from "next/link";
import {
  ArrowRight,
  TrendingUp,
  Sparkles,
  ShoppingBag,
  Zap,
  Star,
  Heart,
  Gift,
  Truck,
  Shield,
} from "lucide-react";
import { Button } from "../ui/Button";

function Banner() {
  return (
    <div>
      {/* Hero Section with Mega Animation */}
      <section className="relative bg-gradient-to-br from-primary-600 via-purple-500 to-secondary-500 text-white overflow-hidden min-h-[600px] flex items-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-white opacity-10 rounded-full blur-3xl -top-48 -left-48 animate-float"></div>
          <div className="absolute w-96 h-96 bg-white opacity-10 rounded-full blur-3xl top-1/3 right-10 animate-float animation-delay-500"></div>
          <div className="absolute w-96 h-96 bg-white opacity-10 rounded-full blur-3xl -bottom-48 -right-48 animate-float animation-delay-1000"></div>

          {/* Floating Shapes */}
          <div className="absolute top-20 left-[10%] animate-float animation-delay-300">
            <div className="w-16 h-16 bg-white/20 rounded-2xl rotate-45 backdrop-blur-sm"></div>
          </div>
          <div className="absolute top-40 right-[15%] animate-float animation-delay-700">
            <div className="w-12 h-12 bg-white/20 rounded-full backdrop-blur-sm"></div>
          </div>
          <div className="absolute bottom-32 left-[20%] animate-float animation-delay-1000">
            <div className="w-20 h-20 bg-white/20 rounded-3xl rotate-12 backdrop-blur-sm"></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="animate-fade-in-down">
                <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                  <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
                  <span className="text-sm font-semibold">
                    AI-Powered Shopping
                  </span>
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
                  <span className=" inline-block animate-gradient bg-clip-text text-transparent bg-gradient-to-r from-white via-primary-200 to-white bg-[length:200%_auto]">
                    Discover Products
                  </span>
                  <br />
                  <span className="inline-block mt-2 text-primary-100 animate-fade-in-up animation-delay-300">
                    Made Just For You
                  </span>
                  <span className="inline-block ml-2 animate-bounce">✨</span>
                </h1>
              </div>

              <p className="text-xl md:text-2xl text-primary-100 mb-10 max-w-2xl animate-fade-in-up animation-delay-500">
                Experience personalized shopping with AI-powered recommendations
                tailored to your unique preferences
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up animation-delay-700">
                <Link href="/products">
                  <Button
                    size="lg"
                    className="group bg-white text-primary-600 hover:bg-primary-50 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-white/50"
                  >
                    <ShoppingBag className="h-5 w-5 group-hover:animate-bounce" />
                    <span className="mx-2">Start Shopping</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/categories">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white hover:text-primary-600 transform hover:scale-105 transition-all duration-300 backdrop-blur-sm bg-white/10"
                  >
                    Explore Categories
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12 animate-fade-in-up animation-delay-1000">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">10K+</div>
                  <div className="text-primary-200 text-sm">
                    Happy Customers
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">5K+</div>
                  <div className="text-primary-200 text-sm">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">98%</div>
                  <div className="text-primary-200 text-sm">Satisfaction</div>
                </div>
              </div>
            </div>

            {/* Right Content - Featured Product Showcase */}
            <div className="hidden lg:block animate-fade-in-up animation-delay-500">
              <div className="relative">
                {/* Main Featured Card */}
                <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl transform hover:scale-105 transition-all duration-500">
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse shadow-xl">
                    <div className="text-center flex">
                      <div className="text-2xl font-bold text-gray-900">
                        50%
                      </div>
                      <div className="text-xs font-semibold text-gray-900">
                        OFF
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/90 rounded-2xl py-2 mb-4 h-64 flex items-center justify-center">
                    <ShoppingBag className="h-32 w-32 text-primary-600" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">
                    Premium Collection
                  </h3>
                  <p className="text-primary-100 text-sm mb-4">
                    Exclusive deals on trending products
                  </p>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-white">
                        $99.99
                      </div>
                      <div className="text-sm text-primary-200 line-through">
                        $199.99
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="bg-white text-primary-600 hover:bg-primary-50"
                    >
                      Shop Now
                    </Button>
                  </div>
                </div>

                {/* Floating Mini Cards */}
                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl animate-float animation-delay-300">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Truck className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">
                        Free Shipping
                      </div>
                      <div className="text-xs text-gray-600">
                        On orders $50+
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-4 -left-8 bg-white rounded-2xl p-4 shadow-xl animate-float">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <Star className="h-6 w-6 text-yellow-600 fill-yellow-600" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">
                        4.9 Rating
                      </div>
                      <div className="text-xs text-gray-600">
                        2,500+ Reviews
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>
    </div>
  );
}

export default Banner;
