import React, { useState } from "react";
import "./HomePage.css"; // Make sure this is imported

const users = {
  consumer: {
    title: "For Consumers",
    content:
      "Consumers can use this website to check the freshness of non-packed food using image uploads or extract expiry dates from packed food labels.",
    image: "Home/consumer.jpg",
  },
  grocery: {
    title: "For Grocery Store Owners",
    content:
      "Helps store owners reduce food waste by tracking expiry dates and freshness, ensuring better inventory management.",
    image: "Home/grocery.jpg",
  },
  restaurant: {
    title: "For Restaurants",
    content:
      "Restaurants can maintain food safety by predicting spoilage early, improving food quality and customer satisfaction.",
    image: "Home/restaurant.webp",
  },
};

export default function HomePage({ onNavigate }) {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="homepage-container">
      {/* Navbar */}
      <nav className="navbar">
        <h1 className="navbar-title">Food Spoilage Predictor</h1>
        <div className="navbar-buttons">
          <button className="nav-btn" onClick={() => onNavigate("login")}>
            Sign In
          </button>
          <button className="nav-btn signup" onClick={() => onNavigate("register")}>
            Sign Up
          </button>
        </div>
      </nav>

      {/* About Section */}
      <section className="about-section">
        <h2>About</h2>
        <p>
          This website uses computer vision and text extraction to predict food
          spoilage. For packed food, it reads expiry dates from images. For
          non-packed food, it determines freshness using image analysis.
        </p>
      </section>

      {/* Who Can Use This Website */}
      <section className="usage-section">
        <h2>Who Can Use This Website?</h2>
        <div className="user-buttons">
          <button onClick={() => setSelectedUser("consumer")}>
            <img src="icon/consumer1.jpg" alt="Consumer" />
            <p>Consumers</p>
          </button>
          <button onClick={() => setSelectedUser("grocery")}>
            <img src="icon/store1.jpg" alt="Grocery Store" />
            <p>Grocery Stores</p>
          </button>
          <button onClick={() => setSelectedUser("restaurant")}>
            <img src="icon/rest.jpg" alt="Restaurant" />
            <p>Restaurants</p>
          </button>
        </div>

        {/* Info Display */}
        {selectedUser && (
          <div className="info-box">
            <h3>{users[selectedUser].title}</h3>
            <img
              src={users[selectedUser].image}
              alt={users[selectedUser].title}
            />
            <p>{users[selectedUser].content}</p>
          </div>
        )}
      </section>
    </div>
  );
}


