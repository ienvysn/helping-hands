const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        volunteerId:{
            type: mongoose.Schema.Types.ObjectId,
            ref : "VolunteerProfile",
            required:true,
        },
        opportunityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Opportunity",
            required: true,
        },
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
            trim: true,
            minlength: 10,
            maxlength: 500,
        },
    },
    {
        timestamps: true, 
    }
);

reviewSchema.index({ volunteerId: 1, opportunityId: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);