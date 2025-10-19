import Banner from "../components/home/Banner";
import TrustBadge from "../components/home/TrustBadge";
import Categories from "../components/home/Categories";
import Products from "../components/home/Products";
import PopularProducts from "../components/home/PopularProducts";
import TrendingProducts from "../components/home/TrendingProducts";

export default function HomePage() {
  return (
    <div className="">
      {/* <div className="container mx-auto"> */}
      <Banner></Banner>
      <TrustBadge></TrustBadge>
      <Categories></Categories>
      <Products></Products>
      <PopularProducts></PopularProducts>
      <TrendingProducts></TrendingProducts>
    </div>
  );
}
