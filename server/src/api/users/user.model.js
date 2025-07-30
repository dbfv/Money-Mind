const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
  },
  avatar: {
    type: String,
    default: '', // Default empty string, will be populated with Cloudinary URL
  },
  investmentProfile: {
    riskTolerance: {
      type: Number,
      min: 1,
      max: 100,
      default: 50,
      required: true,
    },
    monthlyInvestableIncome: {
      type: Number,
      default: 0,
    },
    aiSuggestedIncome: {
      type: Number,
      default: null,
    },
    economicAssumptions: {
      inflationRate: {
        type: Number,
        default: 2.5, // Default inflation rate of 2.5%
      },
      bankInterestRate: {
        type: Number,
        default: 1.0, // Default bank interest rate of 1.0%
      }
    }
  },
  // This reference will be removed in future updates as per spec.md
  sixJarsProfileId: {
    type: Schema.Types.ObjectId,
    ref: 'SixJarsProfile',
    required: false, // Made optional for initial registration
  },
}, {
  timestamps: true,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = model('User', userSchema);
module.exports = User;