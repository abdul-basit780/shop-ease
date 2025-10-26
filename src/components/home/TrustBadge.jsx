import { Heart, Gift, Truck, Shield } from "lucide-react";

function TrustBadge() {
  return (
    <div>
      {/* Trust Badges */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              {
                icon: Truck,
                text: "Free Delivery",
                subtext: "On orders over $50",
              },
              {
                icon: Shield,
                text: "Secure Payment",
                subtext: "100% protected",
              },
              {
                icon: Gift,
                text: "Gift Cards",
                subtext: "Perfect for everyone",
              },
              {
                icon: Heart,
                text: "Support 24/7",
                subtext: "Always here to help",
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="text-center group animate-fade-in"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <div className="font-semibold text-gray-900">{item.text}</div>
                  <div className="text-sm text-gray-600">{item.subtext}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

export default TrustBadge;
