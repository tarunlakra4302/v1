import mongoose, { Schema, model, models } from 'mongoose';

const AlertSchema = new Schema({
  userId: { type: String, required: true },
  symbol: { type: String, required: true },
  company: { type: String, required: true },
  alertName: { type: String, required: true },
  alertType: { type: String, enum: ['upper', 'lower'], required: true },
  threshold: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Alert = models.Alert || model('Alert', AlertSchema);

export default Alert;
