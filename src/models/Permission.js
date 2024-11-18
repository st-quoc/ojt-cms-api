const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  description: String,
});

module.exports = mongoose.model("Permission", permissionSchema);
