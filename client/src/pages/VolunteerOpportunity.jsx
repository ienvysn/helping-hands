import React, { useState, useEffect } from "react";
import { Bell, User, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import "../style/VolunteerOpportunity.css";

//hi

const OpportunityCard = ({ opportunity }) => {
  const org = opportunity.organizationId || {};
  const eventDate = opportunity.eventDate
    ? new Date(opportunity.eventDate)
    : null;
  const formattedDate = eventDate
    ? eventDate.toLocaleDateString()
    : "TBD";
  const dateTimeStr = `${formattedDate} | ${opportunity.startTime || ""} - ${opportunity.endTime || ""}`;

  const tags = [];
  if (opportunity.cause) tags.push(opportunity.cause);
  if (opportunity.durationHours) tags.push(`${opportunity.durationHours}h`);

  const imageSrc = org.logoUrl || opportunity.image || "/images/parkcleanup.png";

  return (
    <div className="opportunityCard">
      <img src={imageSrc} alt={opportunity.title} />

      <div className="cardBody">
        <h4>{opportunity.title}</h4>
        <p className="cardDate">{dateTimeStr}</p>

        <div className="tagRow">
          {tags.map((tag, index) => (
            <span key={index} className="tag">
              {tag}
            </span>
          ))}
        </div>

        {/* organization name intentionally hidden */}

        <button className="moreBtn">More →</button>
      </div>
    </div>
  );
};

const VolunteerOpportunity = () => {
  const [displayName, setDisplayName] = useState("Volunteer");

  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/opportunities`);
        const result = await res.json();
        if (result.success && result.data && result.data.opportunities) {
          setOpportunities(result.data.opportunities);
        } else if (result.success && Array.isArray(result.data)) {
          setOpportunities(result.data);
        } else {
          setOpportunities([]);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load opportunities");
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

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
      <nav className="navbar">
        <div className="navLeft">
          <h1 className="navLogo">helpinghands</h1>
          <div className="navMenu">
            <Link to="/organization-dashboard" className="navLink">
              <span className="navIcon">▦</span> Dashboard
            </Link>
            <a className="navLink active">
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
          <Link to="/profile" className="userProfile">
            <User size={20} />
            <span>{displayName}</span>
          </Link>
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
              {loading && <p>Loading opportunities...</p>}
              {error && <p>{error}</p>}
              {!loading && !error && opportunities
                .slice(featuredIndex, featuredIndex + cardsToShow)
                .map((item) => (
                  <OpportunityCard key={item._id} opportunity={item} />
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
              {loading && <p>Loading opportunities...</p>}
              {error && <p>{error}</p>}
              {!loading && !error && opportunities
                .slice(allIndex, allIndex + cardsToShow)
                .map((item) => (
                  <OpportunityCard key={item._id} opportunity={item} />
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
