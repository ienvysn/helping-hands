import React, { useState, useEffect } from "react";
import {
  Bell,
  User,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "../style/VolunteerOpportunity.css";

const OpportunityCard = ({ opportunity }) => {
  const navigate = useNavigate();
  const org = opportunity.organizationId || {};
  const eventDate = opportunity.eventDate
    ? new Date(opportunity.eventDate)
    : null;
  const formattedDate = eventDate ? eventDate.toLocaleDateString() : "TBD";
  const dateTimeStr = `${formattedDate} | ${opportunity.startTime || ""} - ${
    opportunity.endTime || ""
  }`;

  const tags = [];
  if (opportunity.cause) tags.push(opportunity.cause);
  if (opportunity.durationHours) tags.push(`${opportunity.durationHours}h`);
  tags.push(opportunity.opportunityType === "remote" ? "Remote" : "On-site");

  const imageSrc =
    org.logoUrl ||
    opportunity.imageUrl ||
    opportunity.image ||
    "/images/parkcleanup.png";

  const handleMoreClick = () => {
    navigate(`/opportunities/${opportunity._id}`);
  };

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

        <button className="moreBtn" onClick={handleMoreClick}>
          More →
        </button>
      </div>
    </div>
  );
};

const VolunteerOpportunity = () => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("Volunteer");

  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [search, setSearch] = useState("");
  const [cause, setCause] = useState("");
  const [opportunityType, setOpportunityType] = useState("");
  const [sortBy, setSortBy] = useState("eventDate"); // eventDate, createdAt, durationHours
  const [order, setOrder] = useState("asc");

  const CAUSES = [
    "Animals",
    "Education",
    "Environment",
    "Health",
    "Community",
    "Arts & Culture",
    "Social Services",
    "Other",
  ];

  useEffect(() => {
    fetchOpportunities();
    fetchUserProfile();
  }, [cause, opportunityType, sortBy, order]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOpportunities();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:5000"
        }/api/user/profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.success) {
        setDisplayName(data.data.profile?.displayName || "Volunteer");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (cause) params.append("cause", cause);
      if (opportunityType) params.append("opportunityType", opportunityType);
      if (sortBy) params.append("sortBy", sortBy);
      if (order) params.append("order", order);

      const res = await fetch(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:5000"
        }/api/opportunities?${params.toString()}`
      );
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

  const handleCauseClick = (selectedCause) => {
    setCause((prev) => (prev === selectedCause ? "" : selectedCause));
  };

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
            <Link to="/dashboard" className="navLink">
              <span className="navIcon">▦</span> Dashboard
            </Link>
            <Link to="/opportunities" className="navLink active">
              <span className="navIcon">✦</span> Opportunities
            </Link>
            <Link to="/my-events" className="navLink">
              <span className="navIcon">▥</span> My Events
            </Link>
          </div>
        </div>

        <div className="navRight">
          <button
            className="notificationBtn"
            onClick={() => navigate("/notifications")}
          >
            <Bell size={20} />
          </button>

          <div className="userProfile" onClick={() => navigate("/profile")}>
            <User size={20} />
            <span>{displayName}</span>
          </div>
        </div>
      </nav>

      {/*Page Content*/}
      <div className="opportunityContent">
        {/* Search & Filters */}
        <div className="filterSection">
          <div className="searchBar">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search opportunities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="filterDivider"></div>

            <select
              value={opportunityType}
              onChange={(e) => setOpportunityType(e.target.value)}
              className="filterSelect"
            >
              <option value="">Type: All</option>
              <option value="on-site">On-site</option>
              <option value="remote">Remote</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filterSelect"
            >
              <option value="eventDate">Sort: Date</option>
              <option value="createdAt">Sort: Posted</option>
              <option value="durationHours">Sort: Duration</option>
            </select>

            <select
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className="filterSelect"
            >
              <option value="asc">Asc</option>
              <option value="desc">Desc</option>
            </select>
          </div>
        </div>

        <div className="filterPills">
          <button
            className={`pill ${cause === "" ? "active" : ""}`}
            onClick={() => setCause("")}
          >
            All Causes
          </button>
          {CAUSES.map((c) => (
            <button
              key={c}
              className={`pill ${cause === c ? "active" : ""}`}
              onClick={() => handleCauseClick(c)}
            >
              {c}
            </button>
          ))}
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
              disabled={featuredIndex === 0}
            >
              <ChevronLeft />
            </button>

            <div
              className={`opportunityGrid ${
                !loading && !error && opportunities.length === 0 ? "empty" : ""
              }`}
            >
              {loading && <p>Loading opportunities...</p>}
              {error && <p>{error}</p>}
              {!loading && !error && opportunities.length === 0 && (
                <div className="noOpportunities">
                  <div className="noDataIcon">∅</div>
                  <h3>No Opportunities Found</h3>
                  <p>Try adjusting your search or filters.</p>
                </div>
              )}
              {!loading &&
                !error &&
                opportunities.length > 0 &&
                opportunities
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
              disabled={featuredIndex >= opportunities.length - cardsToShow}
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
              disabled={allIndex === 0}
            >
              <ChevronLeft />
            </button>

            <div
              className={`opportunityGrid ${
                !loading && !error && opportunities.length === 0 ? "empty" : ""
              }`}
            >
              {loading && <p>Loading opportunities...</p>}
              {error && <p>{error}</p>}
              {!loading && !error && opportunities.length === 0 && (
                <div className="noOpportunities">
                  <div className="noDataIcon">∅</div>
                  <h3>No Opportunities Right Now</h3>
                  <p>
                    We couldn't find any opportunities matching your criteria.
                  </p>
                </div>
              )}
              {!loading &&
                !error &&
                opportunities.length > 0 &&
                opportunities
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
              disabled={allIndex >= opportunities.length - cardsToShow}
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
