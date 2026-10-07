import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { CategoryCard } from '../components/CategoryCard';
import { LiquidGoldEmblem } from '../components/LiquidGoldEmblem';
import { api } from '../services/api';

const CATEGORIES_DATA = [
  { name: "Men's Clothing", image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=600&q=80' },
  { name: "Women's Clothing", image: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=600&q=80' },
  { name: 'Jackets & Hoodies', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80' },
  { name: 'Jeans & Trousers', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80' },
  { name: "Men's Shoes", image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80' },
  { name: "Women's Shoes", image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80' },
  { name: 'Slippers & Sandals', image: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&q=80' },
  { name: 'New Arrivals', image: 'https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=600&q=80' },
  { name: 'Offers/Sale', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80' },
];

const EXT_PRODUCTS = [
  {
    id: 'e1',
    name: "Men's Bomber Jacket",
    platform: 'Amazon',
    platformEmoji: '🛒',
    price: 899,
    img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=700&q=80',
    link: 'https://www.amazon.in/Mens-Bomber-Jacket/s?k=Men%27s+Bomber+Jacket',
  },
  {
    id: 'e2',
    name: 'MENZ Casual Sneakers',
    platform: 'Flipkart',
    platformEmoji: '📦',
    price: 700,
    img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=700&q=80',
    link: 'https://www.flipkart.com/menz-men-s-sneakers-shoes-casual-shoes-men-flat-men/p/itm12bca730ae40c',
  },
  {
    id: 'e3',
    name: 'Regular Fit Crew Tee',
    platform: 'Ajio',
    platformEmoji: '👕',
    price: 300,
    img: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=700&q=80&sat=-60',
    link: 'https://www.ajio.com/men-tshirts/c/830216014',
  },
  {
    id: 'e4',
    name: 'Classic Straight Jeans',
    platform: 'Myntra',
    platformEmoji: '👖',
    price: 1500,
    img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=700&q=80',
    link: 'https://www.myntra.com/men-jeans',
  },
];

export const Home = () => {
  const navigate = useNavigate();

  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [offers, setOffers] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featRes, newRes, offRes, allRes] = await Promise.all([
          api.getFeatured(),
          api.getNewArrivals(),
          api.getOffers(),
          api.getProducts({ limit: 100 }),
        ]);

        if (featRes.success) setFeatured(featRes.products);
        if (newRes.success) setNewArrivals(newRes.products);
        if (offRes.success) setOffers(offRes.products);

        if (allRes.success && allRes.products) {
          const counts = {};
          allRes.products.forEach((p) => {
            counts[p.category] = (counts[p.category] || 0) + 1;
          });
          counts['New Arrivals'] = allRes.products.filter((p) => p.newArrival).length;
          counts['Offers/Sale'] = allRes.products.filter((p) => p.mrp > p.price).length;
          setCategoryCounts(counts);
        }
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');

  return (
    <div id="view-home">
      {/* HERO SECTION */}
      <header className="hero">
        <div className="hero-left">
          <div className="hero-eyebrow mono">
            <span className="dot"></span> New drop — Autumn / Winter 01
          </div>
          <h1>
            STEP
            <br />
            INTO
            <br />
            <span className="outline">IT.</span>
          </h1>
          <p className="hero-sub">
            Clothing and footwear built for people who move. Every stitch tested on real streets, not runways. Free shipping on orders over ₹2000.
          </p>
          <div className="hero-cta">
            <button className="btn btn-primary" onClick={() => navigate('/shop')}>
              Shop Now →
            </button>
            <a className="btn btn-ghost" href="#categories-home">
              Browse Categories
            </a>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-glow"></div>
          <div
            style={{
              position: 'absolute',
              top: '-15px',
              right: '-10px',
              zIndex: 5,
              animation: 'floaty 4s ease-in-out infinite',
            }}
            title="WearStep Liquid Gold Seal"
          >
            <LiquidGoldEmblem size={92} />
          </div>
          <img
            className="hero-img-main"
            src="https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=700&q=80"
            alt="Model wearing WearStep outerwear"
          />
          <img
            className="hero-img-float"
            src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80"
            alt="Sneaker detail"
          />
          <div className="hero-badge-float">★ 4.6 rated · 12k+ orders</div>
        </div>
      </header>

      {/* MARQUEE STRIP */}
      <div className="marquee-strip">
        <div className="track">
          <span>FREE SHIPPING OVER ₹2000</span>·<span>NEW ARRIVALS WEEKLY</span>·<span>SUSTAINABLE MATERIALS</span>·<span>EASY 30-DAY RETURNS</span>·
          <span>FREE SHIPPING OVER ₹2000</span>·<span>NEW ARRIVALS WEEKLY</span>·<span>SUSTAINABLE MATERIALS</span>·<span>EASY 30-DAY RETURNS</span>·
        </div>
      </div>

      {/* 01 / CATEGORIES */}
      <section className="hsection" id="categories-home">
        <div className="section-head">
          <h2>
            Shop by
            <br />
            Category
          </h2>
          <div className="mono section-num">01 / Categories</div>
        </div>
        <div className="cat-grid9" id="catGridHome">
          {CATEGORIES_DATA.map((cat) => (
            <CategoryCard
              key={cat.name}
              category={cat.name}
              image={cat.image}
              count={categoryCounts[cat.name] || 0}
            />
          ))}
        </div>
      </section>

      {/* 02 / FEATURED */}
      <section className="hsection" style={{ paddingTop: 0 }}>
        <div className="section-head">
          <h2>
            Featured
            <br />
            Products
          </h2>
          <div className="mono section-num">02 / Featured</div>
        </div>
        <div className="prod-grid" id="featuredGrid">
          {featured.map((p, i) => (
            <ProductCard key={p._id || p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* 03 / NEW ARRIVALS RAIL */}
      <section className="hsection offers-strip">
        <div className="section-head">
          <h2>
            New
            <br />
            Arrivals
          </h2>
          <div className="mono section-num">03 / Just In</div>
        </div>
        <div className="rail" id="newArrivalsRail">
          {newArrivals.map((p, i) => (
            <div key={p._id || p.id} style={{ flexShrink: 0, width: '240px' }}>
              <ProductCard product={p} index={i} />
            </div>
          ))}
        </div>
      </section>

      {/* 04 / SALE / OFFERS */}
      <section className="hsection">
        <div className="section-head">
          <h2>
            Today's
            <br />
            Offers
          </h2>
          <div className="mono section-num">04 / Sale</div>
        </div>
        <div className="prod-grid" id="offersGrid">
          {offers.map((p, i) => (
            <ProductCard key={p._id || p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* 05 / SPOTTED ON OTHER STORES */}
      <section className="hsection">
        <div className="section-head">
          <h2>
            Spotted On
            <br />
            Other Stores
          </h2>
          <div className="mono section-num">05 / Also Available</div>
        </div>
        <p style={{ maxWidth: '560px', marginBottom: '28px', color: '#3d3e3b', fontSize: '14.5px' }}>
          Real, approximate listings from other marketplaces — tap through and it opens their actual live page.
        </p>
        <div className="rail" id="extRail">
          {EXT_PRODUCTS.map((p) => (
            <a
              key={p.id}
              className="ext-rail-card"
              href={p.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="ext-rail-img">
                <span className="ext-badge">
                  {p.platformEmoji} {p.platform}
                </span>
                <img src={p.img} alt={p.name} loading="lazy" />
              </div>
              <div className="ext-rail-info">
                <h4>{p.name}</h4>
                <span className="mono">Approx {fmt(p.price)}</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* 06 / STORY / LOOKBOOK */}
      <section className="hsection" id="story">
        <div className="lookbook">
          <div className="lookbook-imgs">
            <img
              className="tall"
              src="https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=500&q=80"
              alt="Model walking street"
              loading="lazy"
            />
            <img
              className="short"
              src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=500&q=80"
              alt="Close up shoe"
              loading="lazy"
            />
            <img
              className="short"
              src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&q=80"
              alt="Fabric detail"
              loading="lazy"
            />
          </div>
          <div className="lookbook-text">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
              <LiquidGoldEmblem size={52} />
              <span className="mono" style={{ marginBottom: 0 }}>Our Story</span>
            </div>
            <h2>Made for the walk between things.</h2>
            <p>
              WearStep started with one idea: clothes should survive the commute, the errand, and the night out — not just the photo. We design in the city, test on real pavement, and cut every piece to move with you.
            </p>
            <button className="btn btn-ghost" onClick={() => navigate('/shop')}>
              Shop the full range →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
