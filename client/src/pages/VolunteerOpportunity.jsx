import React, { useState, useEffect } from "react";
import {
  Bell,
  User,
  Search,
  ChevronLeft,
  ChevronRight,
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

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 9; // Show 9 items per page (3x3 grid)

  // Filters State
  const [search, setSearch] = useState("");
  const [cause, setCause] = useState("");
  const [opportunityType, setOpportunityType] = useState("");
  const [sortBy, setSortBy] = useState("createdAt"); // Default to newest first
  const [order, setOrder] = useState("desc");

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, cause, opportunityType, sortBy, order]);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Reset to page 1 when searching
      if (page !== 1) {
        setPage(1);
      } else {
        fetchOpportunities();
      }
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      params.append("page", page);
      params.append("limit", limit);

      const res = await fetch(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:5000"
        }/api/opportunities?${params.toString()}`
      );
      const result = await res.json();

      if (result.success && result.data && result.data.opportunities) {
        setOpportunities(result.data.opportunities);
        if (result.data.pagination) {
          setTotalPages(result.data.pagination.totalPages);
        }
      } else {
        setOpportunities([]);
        setTotalPages(1);
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
    setPage(1); // Reset to page 1 on filter change
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
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
              onChange={(e) => {
                setOpportunityType(e.target.value);
                setPage(1);
              }}
              className="filterSelect"
            >
              <option value="">Type: All</option>
              <option value="on-site">On-site</option>
              <option value="remote">Remote</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="filterSelect"
            >
              <option value="createdAt">Sort: Newest</option>
              <option value="eventDate">Sort: Event Date</option>
              <option value="durationHours">Sort: Duration</option>
            </select>

            <select
              value={order}
              onChange={(e) => {
                setOrder(e.target.value);
                setPage(1);
              }}
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
            onClick={() => handleCauseClick("")}
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

        {/* Explore Opportunities Grid */}
        <section>
          <div className="sectionHeader">
            <h2 className="sectionTitle">Explore Opportunities</h2>
            <p className="sectionSubtitle">
              Find and sign up for volunteering events near you.
            </p>
          </div>

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
              opportunities.map((item) => (
                <OpportunityCard key={item._id} opportunity={item} />
              ))}
          </div>

          {/* Pagination Controls */}
          {!loading && !error && totalPages > 1 && (
            <div className="paginationWrapper">
              <button
                className="pageBtn"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <span className="pageInfo">
                Page {page} of {totalPages}
              </span>
              <button
                className="pageBtn"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default VolunteerOpportunity;
