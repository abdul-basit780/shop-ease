import Banner from "../components/home/Banner";
import TrustBadge from "../components/home/TrustBadge";
import Categories from "../components/home/Categories";

export default function HomePage() {
  return (
    <div className="">
      {/* <div className="container mx-auto"> */}
      {/* <h2 className="text-5xl font-bold text-center text-primary-700">
        Welcome to ShopHub!
      </h2>
      <p className="text-xl text-center mt-4 text-gray-600">
        Your personalized shopping experience starts here
      </p> */}
      <Banner></Banner>
      <TrustBadge></TrustBadge>
      <Categories></Categories>
    </div>
  );
}
