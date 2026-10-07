import React from 'react';
import { useNavigate } from 'react-router-dom';

export const CategoryCard = ({ category, count = 0, image }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (category === 'New Arrivals') {
      navigate('/shop?isNew=true');
    } else if (category === 'Offers/Sale') {
      navigate('/shop?onSale=true');
    } else {
      navigate(`/shop?category=${encodeURIComponent(category)}`);
    }
  };

  return (
    <button
      className="cat-card"
      onClick={handleClick}
      type="button"
    >
      <img src={image} alt={category} loading="lazy" />
      <div className="cat-label">
        <span className="mono">{count} items</span>
        <h3>{category}</h3>
      </div>
    </button>
  );
};
