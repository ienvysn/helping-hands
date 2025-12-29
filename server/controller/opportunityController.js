const Opportunity = require("../models/Opportunity");
const Organization = require("../models/Organization");
const Signup = require("../models/SignUp");

const createOpportunity = async (req, res) => {
  try {
    const {
      title,
      description,
      tasks,
      requirements,
      eventDate,
      startTime,

      durationHours,
      opportunityType,
      cause,
      location,
      maxVolunteers,
    } = req.body;

    if (!title || !description || !eventDate) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and event date are required",
      });
    }

    // Validate event date is in the future
    const eventDateObj = new Date(eventDate);
    if (eventDateObj < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Event date must be in the future",
      });
    }

    const organization = await Organization.findOne({ userId: req.user.id });
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization profile not found",
      });
    }

    // Create opportunity
    const opportunity = await Opportunity.create({
      organizationId: organization._id,
      title,
      description,
      tasks: tasks || "",
      requirements: requirements || "",
      eventDate: eventDateObj,
      startTime: startTime || "",

      durationHours: durationHours || 0,
      opportunityType: opportunityType || "on-site",
      cause: cause || "Other",
      location: location || "",
      maxVolunteers: maxVolunteers || null,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Opportunity created successfully",
      data: opportunity,
    });
  } catch (error) {
    console.error("Create opportunity error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating opportunity",
      error: error.message,
    });
  }
};

// Get all opportunities with filters and search
const getAllOpportunities = async (req, res) => {
  try {
    const {
      search,
      cause,
      opportunityType,
      startDate,
      endDate,
      minHours,
      maxHours,
      sortBy = "eventDate",
      order = "asc",
      page = 1,
      limit = 10,
    } = req.query;

    const filter = { isActive: true };

    // Search by title, description, or tasks
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tasks: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by cause
    if (cause) {
      filter.cause = cause;
    }

    // Filter by opportunity type
    if (opportunityType) {
      filter.opportunityType = opportunityType;
    }

    // Filter by date range
    if (startDate || endDate) {
      filter.eventDate = {};
      if (startDate) {
        filter.eventDate.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.eventDate.$lte = new Date(endDate);
      }
    }

    // Filter by duration hours
    if (minHours || maxHours) {
      filter.durationHours = {};
      if (minHours) {
        filter.durationHours.$gte = parseInt(minHours);
      }
      if (maxHours) {
        filter.durationHours.$lte = parseInt(maxHours);
      }
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = order === "desc" ? -1 : 1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const opportunities = await Opportunity.find(filter)
      .populate("organizationId", "organizationName logoUrl averageRating")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Opportunity.countDocuments(filter);

    res.json({
      success: true,
      data: {
        opportunities,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Get opportunities error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching opportunities",
      error: error.message,
    });
  }
};

// Get single opportunity by ID (Public)
const getOpportunityById = async (req, res) => {
  try {
    const { id } = req.params;

    const opportunity = await Opportunity.findById(id).populate(
      "organizationId",
      "organizationName logoUrl averageRating mission contactEmail contactPhone website address"
    );

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found",
      });
    }

    res.json({
      success: true,
      data: opportunity,
    });
  } catch (error) {
    console.error("Get opportunity error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching opportunity",
      error: error.message,
    });
  }
};

// Organization only - must own it)
const updateOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      tasks,
      requirements,
      eventDate,
      startTime,

      durationHours,
      opportunityType,
      cause,
      location,
      maxVolunteers,
      isActive,
    } = req.body;

    // Find opportunity
    const opportunity = await Opportunity.findById(id);
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found",
      });
    }

    // Verify ownership
    const organization = await Organization.findOne({ userId: req.user.id });
    if (!organization || !opportunity.organizationId.equals(organization._id)) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own opportunities",
      });
    }

    // Update fields
    if (title !== undefined) opportunity.title = title;
    if (description !== undefined) opportunity.description = description;
    if (tasks !== undefined) opportunity.tasks = tasks;
    if (requirements !== undefined) opportunity.requirements = requirements;
    if (eventDate !== undefined) opportunity.eventDate = new Date(eventDate);
    if (startTime !== undefined) opportunity.startTime = startTime;

    if (durationHours !== undefined) opportunity.durationHours = durationHours;
    if (opportunityType !== undefined)
      opportunity.opportunityType = opportunityType;
    if (cause !== undefined) opportunity.cause = cause;
    if (location !== undefined) opportunity.location = location;
    if (maxVolunteers !== undefined) opportunity.maxVolunteers = maxVolunteers;
    if (isActive !== undefined) opportunity.isActive = isActive;

    await opportunity.save();

    res.json({
      success: true,
      message: "Opportunity updated successfully",
      data: opportunity,
    });
  } catch (error) {
    console.error("Update opportunity error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating opportunity",
      error: error.message,
    });
  }
};

const deleteOpportunity = async (req, res) => {
  try {
    const { id } = req.params;

    // Find opportunity
    const opportunity = await Opportunity.findById(id);
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found",
      });
    }

    // Verify ownership
    const organization = await Organization.findOne({ userId: req.user.id });
    if (!organization || !opportunity.organizationId.equals(organization._id)) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own opportunities",
      });
    }

    opportunity.isActive = false;
    await opportunity.save();

    res.json({
      success: true,
      message: "Opportunity deleted successfully",
    });
  } catch (error) {
    console.error("Delete opportunity error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting opportunity",
      error: error.message,
    });
  }
};

// (Organization only)
const getMyOpportunities = async (req, res) => {
  try {
    const { page = 1, limit = 10, includeInactive = false } = req.query;

    // Get organization profile
    const organization = await Organization.findOne({ userId: req.user.id });
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization profile not found",
      });
    }

    // Build filter
    const filter = { organizationId: organization._id };
    if (!includeInactive) {
      filter.isActive = true;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const opportunities = await Opportunity.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Opportunity.countDocuments(filter);

    res.json({
      success: true,
      data: {
        opportunities,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Get my opportunities error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching your opportunities",
      error: error.message,
    });
  }
};

const getOpportunitySignups = async (req, res) => {
  try {
    const { opportunityId } = req.params;

    const signups = await Signup.find({
      opportunityId: opportunityId,
      status: { $in: ["pending", "confirmed"] },
    })
      .populate({
        path: "volunteerId",
        select: "displayName profilePictureUrl totalHours aboutMe userId",
        options: { virtuals: true },
        populate: {
          path: "userId",
          select: "email createdAt", // Add email and account creation date
        },
      })
      .sort({ signedUpAt: 1 });

    res.json({
      success: true,
      count: signups.length,
      data: signups,
    });
  } catch (error) {
    console.error("Get signups error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching signups",
      error: error.message,
    });
  }
};

const confirmAllSignups = async (req, res) => {
  try {
    const { opportunityId } = req.params;

    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found",
      });
    }

    const organization = await Organization.findOne({ userId: req.user.id });
    if (!organization || !opportunity.organizationId.equals(organization._id)) {
      return res.status(403).json({
        success: false,
        message: "You can only confirm in your own opportunities",
      });
    }

    const signups = await Signup.find({
      opportunityId: opportunityId,
    });

    const result = await Signup.updateMany(
      { opportunityId, status: "pending" },
      {
        $set: {
          status: "confirmed",
          confirmedAt: new Date(),
        },
      }
    );

    res.json({
      success: true,
      count: result.modifiedCount,
      data: signups,
    });
  } catch (error) {
    console.error("Get signups error:", error);
    res.status(500).json({
      success: false,
      message: "Error confirming all signups",
      error: error.message,
    });
  }
};

const confirmOneSignup = async (req, res) => {
  try {
    const { opportunityId } = req.params;
    const { volunteerId } = req.body;

    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found",
      });
    }

    const organization = await Organization.findOne({ userId: req.user.id });
    if (!organization || !opportunity.organizationId.equals(organization._id)) {
      return res.status(403).json({
        success: false,
        message: "You can only confirm in your own opportunities",
      });
    }

    const result = await Signup.updateOne(
      { opportunityId: opportunityId, volunteerId: volunteerId },
      {
        $set: {
          status: "confirmed",
          confirmedAt: new Date(),
        },
      }
    );

    res.status(200).message(result);
  } catch (error) {
    console.error("Get signups error:", error);
    res.status(500).json({
      success: false,
      message: "Error confirming signups",
      error: error.message,
    });
  }
};

const rejectOneSignup = async (req, res) => {
  try {
    const { opportunityId } = req.params;
    const { volunteerId } = req.body;

    const organization = await Organization.findOne({ userId: req.user.id });
    if (!organization) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const result = await Signup.updateOne(
      {
        opportunityId,
        volunteerId,
        status: "pending",
      },
      {
        $set: {
          status: "rejected",
          rejectedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Pending signup not found",
      });
    }

    res.json({
      success: true,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error rejecting signup",
    });
  }
};

module.exports = {
  createOpportunity,
  getAllOpportunities,
  getOpportunityById,
  updateOpportunity,
  deleteOpportunity,
  getMyOpportunities,
  getOpportunitySignups,
  confirmAllSignups,
  confirmOneSignup,

  rejectOneSignup,
};
