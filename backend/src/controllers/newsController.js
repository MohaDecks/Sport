const News = require('../models/News');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, paginateResponse } = require('../utils/pagination');
const { sendPushForNotification } = require('../utils/notificationHelpers');

const getNews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { isPublished: true };

  if (req.query.search) {
    filter.title = { $regex: req.query.search, $options: 'i' };
  }

  const [news, total] = await Promise.all([
    News.find(filter).populate('author', 'fullName').sort({ createdAt: -1 }).skip(skip).limit(limit),
    News.countDocuments(filter),
  ]);

  res.json({ success: true, ...paginateResponse(news, total, page, limit) });
});

const applyNewsImages = (data, files) => {
  const uploaded = (files?.images || []).map((f) => `/uploads/${f.filename}`);
  if (files?.image?.[0]) {
    data.image = `/uploads/${files.image[0].filename}`;
  }
  if (uploaded.length) {
    data.images = uploaded;
    if (!data.image) data.image = uploaded[0];
  }
};

const createNews = asyncHandler(async (req, res) => {
  const data = { ...req.body, author: req.user._id };
  applyNewsImages(data, req.files);

  const news = await News.create(data);

  if (data.sendPush) {
    const notification = await Notification.create({
      title: news.title,
      message: news.content.substring(0, 200),
      type: 'news',
      targetRole: 'all',
      isPush: true,
      createdBy: req.user._id,
    });
    await sendPushForNotification(notification);
  }

  res.status(201).json({ success: true, data: news });
});

const updateNews = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  applyNewsImages(data, req.files);

  const news = await News.findByIdAndUpdate(req.params.id, data, { new: true });
  if (!news) return res.status(404).json({ success: false, message: 'News not found' });
  res.json({ success: true, data: news });
});

const deleteNews = asyncHandler(async (req, res) => {
  const news = await News.findByIdAndDelete(req.params.id);
  if (!news) return res.status(404).json({ success: false, message: 'News not found' });
  res.json({ success: true, message: 'News deleted' });
});

module.exports = { getNews, createNews, updateNews, deleteNews };
