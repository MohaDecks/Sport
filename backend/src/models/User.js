const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    phone: { type: String, unique: true, sparse: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ['admin', 'coach', 'team'],
      default: 'coach',
    },
    isSuperAdmin: { type: Boolean, default: false },
    adminRole: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminRole' },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    coach: { type: mongoose.Schema.Types.ObjectId, ref: 'Coach' },
    avatar: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    pushToken: { type: String, default: '' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
