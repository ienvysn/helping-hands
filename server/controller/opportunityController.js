const Opportunity = require("../models/Opportunity");
const Organization = require("../models/Organization");
const Signup = require("../models/SignUp");
const { createNotification } = require("../utils/notificationHelper");
const VolunteerProfile = require("../models/Volunteer");

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

    const eventDateObj = new Date(eventDate);

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
          select: "email createdAt",
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

    const pendingSignups = await Signup.find({
      opportunityId,
      status: "pending",
    }).populate("volunteerId");

    const result = await Signup.updateMany(
      { opportunityId, status: "pending" },
      {
        $set: {
          status: "confirmed",
          confirmedAt: new Date(),
        },
      }
    );

    // Notify all volunteers
    for (const signup of pendingSignups) {
      if (signup.volunteerId && signup.volunteerId.userId) {
        await createNotification(
          signup.volunteerId.userId,
          "signup_accepted",
          "Signup Accepted",
          `Your signup for "${opportunity.title}" has been accepted!`
        );
      }
    }

    res.json({
      success: true,
      count: result.modifiedCount,
      data: pendingSignups,
    });
  } catch (error) {
    console.error("Confirm all signups error:", error);
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

    const signup = await Signup.findOne({
      opportunityId,
      volunteerId,
      status: "pending",
    }).populate("volunteerId");

    if (!signup) {
      return res.status(404).json({
        success: false,
        message: "Pending signup not found",
      });
    }

    signup.status = "confirmed";
    signup.confirmedAt = new Date();
    await signup.save();

    // Create notification
    if (signup.volunteerId && signup.volunteerId.userId) {
      await createNotification(
        signup.volunteerId.userId,
        "signup_accepted",
        "Signup Accepted",
        `Your signup for "${opportunity.title}" has been accepted!`
      );
    }

    res.status(200).json({
      success: true,
      message: "Signup confirmed",
      data: signup,
    });
  } catch (error) {
    console.error("Confirm one signup error:", error);
    res.status(500).json({
      success: false,
      message: "Error confirming signup",
      error: error.message,
    });
  }
};

const rejectOneSignup = async (req, res) => {
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
        message: "Unauthorized",
      });
    }

    const signup = await Signup.findOne({
      opportunityId,
      volunteerId,
      status: "pending",
    }).populate("volunteerId");

    if (!signup) {
      return res.status(404).json({
        success: false,
        message: "Pending signup not found",
      });
    }

    signup.status = "rejected";
    signup.rejectedAt = new Date();
    await signup.save();

    // Create notification
    if (signup.volunteerId && signup.volunteerId.userId) {
      await createNotification(
        signup.volunteerId.userId,
        "signup_rejected",
        "Signup Rejected",
        `Your signup for "${opportunity.title}" was not accepted this time.`
      );
    }

    res.json({
      success: true,
      message: "Signup rejected",
    });
  } catch (error) {
    console.error("Reject one signup error:", error);
    res.status(500).json({
      success: false,
      message: "Error rejecting signup",
      error: error.message,
    });
  }
};

const markAttendance = async (req, res) => {
  try {
    const { opportunityId } = req.params;
    const { attendance } = req.body;

    // Validate input
    if (!Array.isArray(attendance) || attendance.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Attendance array is required",
      });
    }

    // Get opportunity
    const opportunity = await Opportunity.findById(opportunityId);
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
        message: "Unauthorized",
      });
    }

    //Diabkled for testing
    // const eventDate = new Date(opportunity.eventDate);
    // if (eventDate > new Date()) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Cannot mark attendance before event date",
    //   });
    // }

    let confirmedCount = 0;
    let noShowCount = 0;
    const errors = [];

    for (const item of attendance) {
      try {
        const signup = await Signup.findById(item.signupId).populate(
          "volunteerId"
        );

        if (!signup) {
          errors.push(`Signup ${item.signupId} not found`);
          continue;
        }

        // Only allow marking attendance for confirmed volunteers
        if (signup.status !== "confirmed") {
          errors.push(
            `Volunteer ${
              signup.volunteerId?.displayName || "Unknown"
            } is not confirmed (Status: ${signup.status})`
          );
          continue;
        }

        console.log(signup);

        if (item.attended === true) {
          const oldTotalHours = signup.volunteerId.totalHours;
          const oldLevel = calculateLevel(oldTotalHours);

          signup.status = "attended";
          signup.attended = true;
          signup.confirmedAt = new Date();
          signup.hoursAwarded = opportunity.durationHours;
          await signup.save();

          signup.volunteerId.totalHours += signup.hoursAwarded;
          await signup.volunteerId.save();

          const newTotalHours = signup.volunteerId.totalHours;
          const newLevel = calculateLevel(newTotalHours);

          // Notification for hours confirmed
          if (signup.volunteerId.userId) {
            await createNotification(
              signup.volunteerId.userId,
              "hours_confirmed",
              "Hours Confirmed",
              `You have been awarded ${signup.hoursAwarded} hours for "${opportunity.title}".`
            );

            // Notification for level up
            if (newLevel > oldLevel) {
              await createNotification(
                signup.volunteerId.userId,
                "level_up",
                "Level Up!",
                `Congratulations! You have reached Level ${newLevel}!`
              );
            }
          }

          confirmedCount++;
        } else {
          signup.status = "no-show";
          signup.attended = false;
          signup.hoursAwarded = 0;
          await signup.save();

          // Notification for no-show
          if (signup.volunteerId && signup.volunteerId.userId) {
            await createNotification(
              signup.volunteerId.userId,
              "attendance_not_confirmed",
              "Attendance Not Confirmed",
              `Your attendance for "${opportunity.title}" was marked as no-show.`
            );
          }
          noShowCount++;
        }
      } catch (err) {
        errors.push(`Error processing signup ${item.signupId}: ${err.message}`);
      }
    }

    res.json({
      success: true,
      message: `Attendance marked successfully`,
      data: {
        confirmed: confirmedCount,
        noShows: noShowCount,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error) {
    console.error("Mark attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Error marking attendance",
      error: error.message,
    });
  }
};

const calculateLevel = (totalHours) => {
  if (totalHours < 10) return 1;
  if (totalHours < 25) return 2;
  if (totalHours < 50) return 3;
  if (totalHours < 100) return 4;
  if (totalHours < 200) return 5;
  return Math.floor(totalHours / 100) + 4;
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
  markAttendance,
  calculateLevel,
};

