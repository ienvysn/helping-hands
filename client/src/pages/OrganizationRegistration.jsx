import React, { useState, useEffect } from "react";
import "../style/OrganizationRegistration.css";
import { useNavigate } from "react-router-dom";

const OrganizationRegistration = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        organizationName: "",
        mission: "",
        yearEstablished: "",
        organizationSize: "",
        logoUrl: "", // simplistic handling for now
        website: "",
        categories: [],
        contactEmail: "",
        contactPhone: "",
        address: "",
        description: "",
        socialMedia: {
            facebook: "",
            twitter: "",
            instagram: "",
            linkedin: "",
        },
        agreeToTerms: false,
    });

    const CATEGORIES = [
        "Animals",
        "Education",
        "Healthcare",
        "Environment",
        "Others",
    ];

    useEffect(() => {
        // Fetch initial data (e.g. organization name if already set)
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    navigate("/login");
                    return;
                }

                const res = await fetch("http://localhost:5000/api/user/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();

                if (data.success) {
                    // Pre-fill existing data
                    const org = data.data.profile || {};
                    const user = data.data.user || {};

                    setFormData((prev) => ({
                        ...prev,
                        organizationName: org.organizationName || user.displayName || "",
                        contactEmail: user.email || "", // Default to user email
                    }));
                }
            } catch (err) {
                console.error("Failed to fetch profile", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.startsWith("social_")) {
            const platform = name.split("_")[1];
            setFormData(prev => ({
                ...prev,
                socialMedia: {
                    ...prev.socialMedia,
                    [platform]: value
                }
            }));
        } else if (name === "categories") {
            // Handle checkbox group for categories
            // Note: The UI shows checkboxes for multiple categories
            // We'll trust the 'value' passed is the category name
            // actually for checkboxes, name is usually the same, value is explicit
        } else if (type === "checkbox" && name === "agreeToTerms") {
            setFormData({ ...formData, [name]: checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleCategoryChange = (category) => {
        setFormData((prev) => {
            const isSelected = prev.categories.includes(category);
            if (isSelected) {
                return { ...prev, categories: prev.categories.filter((c) => c !== category) };
            } else {
                return { ...prev, categories: [...prev.categories, category] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.agreeToTerms) {
            alert("Please agree to the terms and conditions.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/api/user/profile/organization", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (data.success) {
                // Navigate to dashboard after successful profile completion
                navigate("/organization-dashboard");
            } else {
                alert(data.message || "Failed to update profile");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("An error occurred. Please try again.");
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="org-reg-wrapper">
            <div className="org-reg-container">
                <div className="org-reg-header">
                    {/* We could use an img tag here if we have the asset, relying on CSS gradient for now matching the blue theme */}
                    <h1>Helping Hands</h1>
                </div>

                <h2 className="form-title">Organization Registration Form</h2>

                <form onSubmit={handleSubmit}>

                    {/* Organization Information */}
                    <div className="form-section">
                        <h3 className="section-header">Organization Information</h3>

                        <div className="form-group">
                            <label className="form-label">Organization Name</label>
                            <input
                                type="text"
                                name="organizationName"
                                className="form-input"
                                placeholder="Enter the name"
                                value={formData.organizationName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Mission Statement</label>
                            <textarea
                                name="mission"
                                className="form-textarea"
                                placeholder="Enter your organization mission"
                                value={formData.mission}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Year Established</label>
                            <input
                                type="text" // using text to allow flexibility or simple year
                                name="yearEstablished"
                                className="form-input"
                                placeholder="Enter the year your organization was established"
                                value={formData.yearEstablished}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Organization Size</label>
                            <select
                                name="organizationSize"
                                className="form-select"
                                value={formData.organizationSize}
                                onChange={handleChange}
                            >
                                <option value="">Select Size</option>
                                <option value="1-10">1-10 employees</option>
                                <option value="11-50">11-50 employees</option>
                                <option value="51-200">51-200 employees</option>
                                <option value="201+">201+ employees</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Organization Logo</label>
                            <div className="file-input-wrapper">
                                {/* Placeholder for file input */}
                                <button type="button" className="file-input-btn" onClick={() => alert("File upload implementation pending backend support.")}>Choose File</button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Website</label>
                            <input
                                type="url"
                                name="website"
                                className="form-input"
                                placeholder="Enter your website URL"
                                value={formData.website}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Categories/Causes</label>
                            <div className="checkbox-group">
                                {CATEGORIES.map((cat) => (
                                    <label key={cat} className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={formData.categories.includes(cat)}
                                            onChange={() => handleCategoryChange(cat)}
                                        />
                                        {cat}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Contact Details */}
                    <div className="form-section">
                        <h3 className="section-header">Contact Details</h3>

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                name="contactEmail"
                                className="form-input"
                                placeholder="Enter the your email"
                                value={formData.contactEmail}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Phone number</label>
                            <input
                                type="tel"
                                name="contactPhone"
                                className="form-input"
                                placeholder="Enter the your number"
                                value={formData.contactPhone}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Address</label>
                            <input
                                type="text"
                                name="address"
                                className="form-input"
                                placeholder="Enter your address"
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* About the Organization */}
                    <div className="form-section">
                        <h3 className="section-header">About the Organization</h3>

                        <div className="form-group">
                            <label className="form-label">Description (detailed about us)</label>
                            <textarea
                                name="description"
                                className="form-textarea"
                                placeholder="Enter a detailed description about your organization"
                                value={formData.description}
                                onChange={handleChange}
                                rows={5}
                            />
                        </div>
                    </div>

                    {/* Social Media Links */}
                    <div className="form-section">
                        <h3 className="section-header">Social Media Links</h3>
                        <label className="form-label">Social Media Links</label>
                        <div className="social-grid">
                            <input
                                type="text"
                                name="social_facebook"
                                className="form-input"
                                placeholder="Facebook URL"
                                value={formData.socialMedia.facebook}
                                onChange={handleChange}
                            />
                            <input
                                type="text"
                                name="social_twitter"
                                className="form-input"
                                placeholder="Twitter URL"
                                value={formData.socialMedia.twitter}
                                onChange={handleChange}
                            />
                            <input
                                type="text"
                                name="social_instagram"
                                className="form-input"
                                placeholder="Instagram URL"
                                value={formData.socialMedia.instagram}
                                onChange={handleChange}
                            />
                            <input
                                type="text"
                                name="social_linkedin"
                                className="form-input"
                                placeholder="Linkedin URL"
                                value={formData.socialMedia.linkedin}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Terms */}
                    <div className="terms-section">
                        <label className="checkbox-label" style={{ fontSize: '1rem', fontWeight: 600 }}>
                            <input
                                type="checkbox"
                                name="agreeToTerms"
                                checked={formData.agreeToTerms}
                                onChange={handleChange}
                            />
                            I agree to terms and conditions
                        </label>
                    </div>

                    {/* Submit */}
                    <div className="submit-btn-wrapper">
                        <button type="submit" className="submit-btn">Submit</button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default OrganizationRegistration;
