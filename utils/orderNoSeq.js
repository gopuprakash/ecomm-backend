const mongoose = require("mongoose");

// Create a schema for the sequence.
const sequenceSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sequence_value: { type: Number, default: 1000000000 },
});

// Create a model for the sequence.
const Sequence = mongoose.model("Sequence", sequenceSchema);

const getNextSequenceValue = async (sequenceName) => {
  const sequenceDocument = await Sequence.findByIdAndUpdate(
    sequenceName,
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  );

  return sequenceDocument.sequence_value;
};

module.exports = { getNextSequenceValue };
