require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Team = require('../models/Team');
const Player = require('../models/Player');
const Coach = require('../models/Coach');
const Tournament = require('../models/Tournament');
const Match = require('../models/Match');
const Standing = require('../models/Standing');
const News = require('../models/News');
const AdminRole = require('../models/AdminRole');
const { seedDefaultRoles } = require('./seedRoles');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    await Promise.all([
      User.deleteMany(), Team.deleteMany(), Player.deleteMany(),
      Coach.deleteMany(), Tournament.deleteMany(), Match.deleteMany(),
      Standing.deleteMany(), News.deleteMany(), AdminRole.deleteMany(),
    ]);

    const roles = await seedDefaultRoles();

    const admin = await User.create({
      fullName: 'System Admin',
      email: 'admin@dsms.com',
      password: 'admin123',
      role: 'admin',
      isSuperAdmin: true,
      adminRole: roles['Super Admin']._id,
    });

    await User.create({
      fullName: 'Sports Director Demo',
      email: 'director@dsms.com',
      password: 'director123',
      role: 'admin',
      isSuperAdmin: false,
      adminRole: roles['Sports Director']._id,
    });

    await User.create({
      fullName: 'Tournament Manager Demo',
      email: 'tournament@dsms.com',
      password: 'tournament123',
      role: 'admin',
      isSuperAdmin: false,
      adminRole: roles['Tournament Manager']._id,
    });

    await User.create({
      fullName: 'Viewer Demo',
      email: 'viewer@dsms.com',
      password: 'viewer123',
      role: 'admin',
      isSuperAdmin: false,
      adminRole: roles.Viewer._id,
    });

    const teams = await Team.insertMany([
      { name: 'District FC', district: 'Central', category: 'Football' },
      { name: 'Eagles United', district: 'North', category: 'Football' },
      { name: 'Hoops Stars', district: 'South', category: 'Basketball' },
      { name: 'Volley Kings', district: 'East', category: 'Volleyball' },
    ]);

    const coaches = await Coach.insertMany([
      { fullName: 'Ahmed Hassan', phone: '+252611111111', email: 'ahmed@dsms.com', team: teams[0]._id },
      { fullName: 'Omar Ali', phone: '+252622222222', email: 'omar@dsms.com', team: teams[1]._id },
    ]);

    await Team.findByIdAndUpdate(teams[0]._id, { coach: coaches[0]._id });
    await Team.findByIdAndUpdate(teams[1]._id, { coach: coaches[1]._id });

    await User.create({
      fullName: 'Ahmed Hassan',
      email: 'ahmed@dsms.com',
      phone: '+252611111111',
      password: 'coach123',
      role: 'coach',
      coach: coaches[0]._id,
      team: teams[0]._id,
    });

    await User.create({
      fullName: 'District FC Team',
      email: 'team@dsms.com',
      phone: '+252633333333',
      password: 'team123',
      role: 'team',
      team: teams[0]._id,
    });

    await Player.insertMany([
      { fullName: 'Mohamed Ibrahim', age: 22, position: 'Forward', jerseyNumber: 9, team: teams[0]._id },
      { fullName: 'Yusuf Abdi', age: 24, position: 'Midfielder', jerseyNumber: 8, team: teams[0]._id },
      { fullName: 'Hassan Noor', age: 26, position: 'Defender', jerseyNumber: 4, team: teams[0]._id },
      { fullName: 'Ali Warsame', age: 23, position: 'Goalkeeper', jerseyNumber: 1, team: teams[1]._id },
      { fullName: 'Farah Mohamed', age: 21, position: 'Forward', jerseyNumber: 10, team: teams[1]._id },
    ]);

    const tournament = await Tournament.create({
      name: 'District Premier Cup 2026',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-06-30'),
      status: 'Ongoing',
      teams: [teams[0]._id, teams[1]._id],
    });

    await Standing.insertMany([
      { tournament: tournament._id, team: teams[0]._id },
      { tournament: tournament._id, team: teams[1]._id },
    ]);

    const today = new Date();
    await Match.create({
      homeTeam: teams[0]._id,
      awayTeam: teams[1]._id,
      matchDate: today,
      matchTime: '15:00',
      stadium: 'District Stadium',
      tournament: tournament._id,
      status: 'Upcoming',
    });

    await News.create([
      {
        title: 'Welcome to District Sports Management System',
        content: 'The new season has officially started. All teams are ready for an exciting tournament!',
        image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
        author: admin._id,
        isPublished: true,
      },
      {
        title: 'District Premier Cup 2026',
        content: 'Registration is open for all district teams. Join the biggest tournament of the year!',
        image: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&q=80',
        author: admin._id,
        isPublished: true,
      },
      {
        title: 'Match Day This Weekend',
        content: 'District FC vs Eagles United — Sunday 3PM at District Stadium. Be there!',
        image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80',
        author: admin._id,
        isPublished: true,
      },
    ]);

    console.log('Seed data created successfully!');
    console.log('');
    console.log('=== Admin Logins ===');
    console.log('Super Admin:        admin@dsms.com / admin123');
    console.log('Sports Director:    director@dsms.com / director123');
    console.log('Tournament Manager: tournament@dsms.com / tournament123');
    console.log('Viewer (read-only): viewer@dsms.com / viewer123');
    console.log('');
    console.log('=== Mobile Logins ===');
    console.log('Coach login: ahmed@dsms.com / coach123');
    console.log('Team login: team@dsms.com / team123');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
