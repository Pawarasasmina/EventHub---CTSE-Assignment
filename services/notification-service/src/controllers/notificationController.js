const Notification = require('../models/Notification');
const { sendSuccess } = require('../utils/response');

const canAccessNotification = (req, notification) => req.user?.role === 'admin' || req.user?.id === notification.userId;

const sendNotification = async (req, res) => {
  if (!req.internalService && req.user.role !== 'admin' && req.user.id !== req.body.userId) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  const notification = await Notification.create({
    ...req.body,
    status: 'sent'
  });

  return sendSuccess(res, 201, 'Notification stored successfully', notification);
};

const getNotificationsByUser = async (req, res) => {
  if (req.user.role !== 'admin' && req.user.id !== req.params.userId) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  const notifications = await Notification.find({ userId: req.params.userId }).sort({ createdAt: -1 });
  return sendSuccess(res, 200, 'Notifications retrieved', notifications);
};

const getNotificationById = async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }

  if (!canAccessNotification(req, notification)) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  return sendSuccess(res, 200, 'Notification retrieved', notification);
};

const markNotificationAsRead = async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }

  if (!canAccessNotification(req, notification)) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  notification.isRead = true;
  notification.readAt = notification.readAt || new Date();
  await notification.save();

  return sendSuccess(res, 200, 'Notification marked as read', notification);
};

module.exports = {
  sendNotification,
  getNotificationsByUser,
  getNotificationById,
  markNotificationAsRead
};
