const jwt = require('jsonwebtoken');
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const PatientProfile = require('../models/PatientProfile');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'curahealth_super_secret_jwt_key_2026',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new user (Patient or Doctor)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role = 'patient',
      phone,
      gender,
      dateOfBirth,
      address,
      // Doctor-specific fields
      specialization,
      qualifications,
      experience,
      fees,
      about,
      clinicAddress,
      // Patient-specific fields
      bloodGroup,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email address',
      });
    }

    // Role cannot be registered as admin directly via public register
    const assignedRole = role === 'doctor' ? 'doctor' : 'patient';

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      phone: phone || '',
      gender: gender || 'unspecified',
      dateOfBirth: dateOfBirth || null,
      address: address || '',
    });

    let profile = null;

    if (assignedRole === 'doctor') {
      profile = await DoctorProfile.create({
        user: user._id,
        specialization: specialization || 'General Physician',
        qualifications: qualifications
          ? Array.isArray(qualifications)
            ? qualifications
            : qualifications.split(',').map((q) => q.trim())
          : ['MBBS'],
        experience: Number(experience) || 1,
        fees: Number(fees) || 50,
        about: about || 'Dedicated medical professional serving patients.',
        clinicAddress: clinicAddress || 'General Clinic',
        isApproved: false, // requires admin approval
      });
    } else {
      profile = await PatientProfile.create({
        user: user._id,
        bloodGroup: bloodGroup || 'Unknown',
      });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        address: user.address,
        profile,
      },
      message:
        assignedRole === 'doctor'
          ? 'Registration successful! Your doctor profile is pending admin approval.'
          : 'Registration successful! Welcome to CuraHealth.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    let profile = null;
    if (user.role === 'doctor') {
      profile = await DoctorProfile.findOne({ user: user._id });
    } else if (user.role === 'patient') {
      profile = await PatientProfile.findOne({ user: user._id });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        address: user.address,
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let profile = null;

    if (user.role === 'doctor') {
      profile = await DoctorProfile.findOne({ user: user._id });
    } else if (user.role === 'patient') {
      profile = await PatientProfile.findOne({ user: user._id });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        address: user.address,
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      gender,
      dateOfBirth,
      address,
      // Doctor specific
      specialization,
      qualifications,
      experience,
      fees,
      about,
      clinicAddress,
      availableDays,
      workingHours,
      slotDuration,
      // Patient specific
      bloodGroup,
      allergies,
      medicalHistory,
      emergencyContact,
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (gender !== undefined) user.gender = gender;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (address !== undefined) user.address = address;

    await user.save();

    let profile = null;
    if (user.role === 'doctor') {
      profile = await DoctorProfile.findOne({ user: user._id });
      if (!profile) {
        profile = new DoctorProfile({ user: user._id, specialization: specialization || 'General Physician' });
      }

      if (specialization) profile.specialization = specialization;
      if (qualifications) {
        profile.qualifications = Array.isArray(qualifications)
          ? qualifications
          : qualifications.split(',').map((q) => q.trim());
      }
      if (experience !== undefined) profile.experience = Number(experience);
      if (fees !== undefined) profile.fees = Number(fees);
      if (about !== undefined) profile.about = about;
      if (clinicAddress !== undefined) profile.clinicAddress = clinicAddress;
      if (availableDays) profile.availableDays = availableDays;
      if (workingHours) profile.workingHours = workingHours;
      if (slotDuration) profile.slotDuration = Number(slotDuration);

      await profile.save();
    } else if (user.role === 'patient') {
      profile = await PatientProfile.findOne({ user: user._id });
      if (!profile) {
        profile = new PatientProfile({ user: user._id });
      }

      if (bloodGroup) profile.bloodGroup = bloodGroup;
      if (allergies) {
        profile.allergies = Array.isArray(allergies)
          ? allergies
          : allergies.split(',').map((a) => a.trim());
      }
      if (medicalHistory) {
        profile.medicalHistory = Array.isArray(medicalHistory)
          ? medicalHistory
          : medicalHistory.split(',').map((m) => m.trim());
      }
      if (emergencyContact) profile.emergencyContact = emergencyContact;

      await profile.save();
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        address: user.address,
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
};
