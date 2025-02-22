const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
    {
        workTitle: {
            type: String,
            trim: true,
        }, 
        deadline: Date, 
        taskTitle: {
            type: String,
            required: true,
            trim: true,
        },
        assignee: {
            type: String,
            required: true,
            trim: true,
        },
        assignor: {
            type: String,
            required: true,
            trim: true,
        },
        priority: {
            type: String,
            default: "normal",
            enum: ["normal", "low", "high", "urgent"], 
        },
        status: {
            type: String,
            default: "todo", 
            enum: ["done", "inprogress", "todo", "abandoned"], 
        },
    },
    {
        timestamps: true, 
    }
);

const Task = mongoose.model("tasks", taskSchema); 

module.exports = Task;
