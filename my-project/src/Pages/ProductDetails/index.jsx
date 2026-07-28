import { useContext, useEffect, useMemo, useState } from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import { Link, useParams } from "react-router-dom";
import ProductZoom from "../../components/ProductZoom";
import ProductsSlider from "../../components/ProductsSlider";
import ProductDetailsComponent from "../../components/ProductDetails";
import { MyContext } from "../../App";
import { fetchDataFromApi } from "../../utils/api";

const ProductDetails = () => {
  const { id } = useParams();
  const { products } = useContext(MyContext);
  const [fetchedProduct, setFetchedProduct] = useState(null);
  const cachedProduct = products.find((item) => item._id === id) || null;
  const product =
    cachedProduct || (fetchedProduct?._id === id ? fetchedProduct : null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (cachedProduct) return;
    let active = true;
    fetchDataFromApi(`/api/product/${id}`).then((result) => {
      if (active) {
        setFetchedProduct(result?.success ? result.product : null);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [id, cachedProduct]);

  const related = useMemo(
    () =>
      products
        .filter((item) => item._id !== id && item.catId === product?.catId)
        .slice(0, 12),
    [products, id, product?.catId],
  );
  if (loading && !product)
    return (
      <div className="container py-20 text-center">Loading product...</div>
    );
  if (!product)
    return (
      <div className="container py-20 text-center">Product not found.</div>
    );

  return (
    <>
      <div className="py-5">
        <div className="container">
          <Breadcrumbs>
            <Link to="/">Home</Link>
            <Link to={`/productListing?category=${product.catId}`}>
              {product.catName || "Products"}
            </Link>
            <span>{product.name}</span>
          </Breadcrumbs>
        </div>
      </div>
      <section className="bg-white py-5">
        <div className="container flex flex-col lg:flex-row gap-8 items-start">
          <div className="w-full lg:w-[45%] min-w-0">
            <ProductZoom product={product} />
          </div>
          <div className="w-full lg:w-[55%] lg:pr-10 lg:pl-6">
            <ProductDetailsComponent product={product} />
          </div>
        </div>
        {related.length > 0 && (
          <div className="container pt-8">
            <h2 className="text-[20px] font-[600]">Related Products</h2>
            <ProductsSlider items={6} products={related} />
          </div>
        )}
      </section>
    </>
  );
};

export default ProductDetails;
