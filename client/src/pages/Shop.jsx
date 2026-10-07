import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { api } from '../services/api';

const CATEGORIES = [
  "Men's Clothing",
  "Women's Clothing",
  'Jackets & Hoodies',
  'Jeans & Trousers',
  "Men's Shoes",
  "Women's Shoes",
  'Slippers & Sandals',
];

export const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters from query or state
  const activeCategory = searchParams.get('category') || '';
  const isNew = searchParams.get('isNew') === 'true';
  const onSale = searchParams.get('onSale') === 'true';
  const searchTerm = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'relevance';

  useEffect(() => {
    fetchFilteredProducts();
  }, [searchParams]);

  const fetchFilteredProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeCategory) params.category = activeCategory;
      if (isNew) params.isNew = true;
      if (onSale) params.onSale = true;
      if (searchTerm) params.search = searchTerm;
      if (sort && sort !== 'relevance') params.sort = sort;

      const res = await api.getProducts(params);
      if (res.success) {
        setProducts(res.products);
        setTotal(res.total || res.count);
      }
    } catch (err) {
      console.error('Error fetching shop products:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === undefined || value === '') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  let pageTitle = 'All Products';
  if (activeCategory) pageTitle = activeCategory;
  else if (isNew) pageTitle = 'New Arrivals';
  else if (onSale) pageTitle = 'Offers / Sale';
  else if (searchTerm) pageTitle = `Results for "${searchTerm}"`;

  return (
    <div id="view-shop">
      <div className="shop-wrap">
        {/* SIDEBAR FILTERS */}
        <aside className="filter-panel">
          <h4>Categories</h4>
          <div className="filter-group">
            {CATEGORIES.map((cat) => (
              <label
                key={cat}
                className={`filter-opt ${activeCategory === cat ? 'active-cat' : ''}`}
              >
                <input
                  type="radio"
                  name="fcat"
                  value={cat}
                  checked={activeCategory === cat}
                  onChange={() => {
                    const next = new URLSearchParams(searchParams);
                    next.set('category', cat);
                    next.delete('isNew');
                    next.delete('onSale');
                    setSearchParams(next);
                  }}
                />
                {cat}
              </label>
            ))}

            <label className={`filter-opt ${!activeCategory && !isNew && !onSale ? 'active-cat' : ''}`}>
              <input
                type="radio"
                name="fcat"
                value=""
                checked={!activeCategory && !isNew && !onSale}
                onChange={() => {
                  const next = new URLSearchParams(searchParams);
                  next.delete('category');
                  next.delete('isNew');
                  next.delete('onSale');
                  setSearchParams(next);
                }}
              />
              All Products
            </label>
          </div>

          <h4>Availability</h4>
          <div className="filter-group">
            <label className="filter-opt">
              <input
                type="checkbox"
                checked={isNew}
                onChange={(e) => updateParam('isNew', e.target.checked ? 'true' : '')}
              />
              New Arrivals
            </label>
            <label className="filter-opt">
              <input
                type="checkbox"
                checked={onSale}
                onChange={(e) => updateParam('onSale', e.target.checked ? 'true' : '')}
              />
              On Sale
            </label>
          </div>

          {(activeCategory || isNew || onSale || searchTerm) && (
            <button
              className="btn btn-ghost btn-sm btn-block"
              onClick={clearAllFilters}
              style={{ marginTop: '10px' }}
            >
              Reset All Filters
            </button>
          )}
        </aside>

        {/* MAIN PRODUCT AREA */}
        <div>
          <div className="shop-header">
            <h2>{pageTitle}</h2>

            <div className="sort-row">
              <span className="mono" style={{ color: 'var(--steel)' }}>
                Sort
              </span>
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
              >
                <option value="relevance">Relevance</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          {/* ACTIVE FILTER CHIPS */}
          <div className="filter-chip-row">
            {activeCategory && (
              <div className="filter-chip">
                {activeCategory}
                <button onClick={() => updateParam('category', '')}>✕</button>
              </div>
            )}
            {isNew && (
              <div className="filter-chip">
                New Arrivals
                <button onClick={() => updateParam('isNew', '')}>✕</button>
              </div>
            )}
            {onSale && (
              <div className="filter-chip">
                On Sale
                <button onClick={() => updateParam('onSale', '')}>✕</button>
              </div>
            )}
            {searchTerm && (
              <div className="filter-chip">
                Search: "{searchTerm}"
                <button onClick={() => updateParam('search', '')}>✕</button>
              </div>
            )}
          </div>

          {/* PRODUCT GRID */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <span className="mono" style={{ color: 'var(--steel)' }}>
                Loading catalog...
              </span>
            </div>
          ) : products.length > 0 ? (
            <div className="prod-grid" id="shopGrid">
              {products.map((p, i) => (
                <ProductCard key={p._id || p.id} product={p} index={i} />
              ))}
            </div>
          ) : (
            <div className="no-results">
              <div className="emoji">🔍</div>
              <p>
                Nothing matches that yet.
                <br />
                Try a different filter or search term.
              </p>
              <button
                className="btn btn-primary"
                onClick={clearAllFilters}
                style={{ marginTop: '16px' }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
