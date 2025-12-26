import React, { useState } from "react";
import { Bell, User, Search, ChevronLeft, ChevronRight } from "lucide-react";
import "../style/VolunteerOpportunity.css";

const OpportunityCard = ({ image, title, date, tags }) => {
  return (
    <div className="opportunityCard">
      <img src={image} alt={title} />

      <div className="cardBody">
        <h4>{title}</h4>
        <p className="cardDate">{date}</p>

        <div className="tagRow">
          {tags.map((tag, index) => (
            <span key={index} className="tag">
              {tag}
            </span>
          ))}
        </div>

        <button className="moreBtn">More →</button>
      </div>
    </div>
  );
};

/*Main Volunteer Opportunity Page*/
const VolunteerOpportunity = () => {
  const displayName = "Brad Pitt";

  const opportunities = [
    {
      image: "/images/parkcleanup.png",
      title: "Park Clean-up & Tree Planting",
      date: "Sat, Jun 15 | 9:00 - 12:00 | Jhamsikhel",
      tags: ["Planting 2h", "Cleaning 1h"],
    },
    {
      image: "/images/dogwalking.png",
      title: "Weekend Dog Walking",
      date: "Sun, Jun 18 | 9:00 - 10:00 | Lalitpur",
      tags: ["Animal 1h"],
    },
    {
      image: "/images/rivercleaning.png",
      title: "River Cleaning Activity",
      date: "Sun, Jun 18 | 9:00 - 10:00 | Bagmati River",
      tags: ["Cleaning 1h"],
    },
  ];

  /*Carousel State & Settings*/
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [allIndex, setAllIndex] = useState(0);
  const cardsToShow = 3;

  const slideLeft = (indexSetter, currentIndex) => {
    indexSetter(Math.max(currentIndex - 1, 0));
  };

  const slideRight = (indexSetter, currentIndex, length) => {
    indexSetter(Math.min(currentIndex + 1, length - cardsToShow));
  };

  return (
    <div className="dashboardWrapper">
      {/*Navbar Section*/}
      <nav className="navbar">
        <div className="navLeft">
          <h1 className="navLogo">helpinghands</h1>
          <div className="navMenu">
            <a className="navLink" href="/dashboard">
              <span className="navIcon">▦</span> Dashboard
            </a>
            <a className="navLink active" href="/opportunities">
              <span className="navIcon">✦</span> Opportunities
            </a>
            <a className="navLink" href="/myevents">
              <span className="navIcon">▥</span> My Events
            </a>
          </div>
        </div>

        <div className="navRight">
          <button className="notificationBtn">
            <Bell size={20} />
          </button>
          <div className="userProfile">
            <User size={20} />
            <span>{displayName}</span>
          </div>
        </div>
      </nav>

      {/*Page Content*/}
      <div className="opportunityContent">
        {/* Search Bar */}
        <div className="searchBar">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search opportunities by category, date, type, newest ..."
          />
          <div className="filterPills">
            <button className="pill active">All</button>
            <button className="pill">Animal</button>
            <button className="pill">Cleaning</button>
          </div>
        </div>

        {/*Featured Opportunities*/}
        <section>
          <h2 className="sectionTitle">Featured Opportunities</h2>
          <p className="sectionSubtitle">
            Explore volunteering opportunities near you.
          </p>

          <div className="carouselWrapper">
            <button
              className="carouselBtn"
              onClick={() => slideLeft(setFeaturedIndex, featuredIndex)}
            >
              <ChevronLeft />
            </button>

            <div className="opportunityGrid">
              {opportunities
                .slice(featuredIndex, featuredIndex + cardsToShow)
                .map((item, index) => (
                  <OpportunityCard key={index} {...item} />
                ))}
            </div>

            <button
              className="carouselBtn"
              onClick={() =>
                slideRight(
                  setFeaturedIndex,
                  featuredIndex,
                  opportunities.length
                )
              }
            >
              <ChevronRight />
            </button>
          </div>
        </section>

        {/*All Opportunities*/}
        <section>
          <h2 className="sectionTitle">All Opportunities</h2>

          <div className="carouselWrapper">
            <button
              className="carouselBtn"
              onClick={() => slideLeft(setAllIndex, allIndex)}
            >
              <ChevronLeft />
            </button>

            <div className="opportunityGrid">
              {opportunities
                .slice(allIndex, allIndex + cardsToShow)
                .map((item, index) => (
                  <OpportunityCard key={index} {...item} />
                ))}
            </div>

            <button
              className="carouselBtn"
              onClick={() =>
                slideRight(setAllIndex, allIndex, opportunities.length)
              }
            >
              <ChevronRight />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default VolunteerOpportunity;
