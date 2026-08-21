const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const router = express.Router();

module.exports = (controllers) => {
  router.post('/districts', verifyToken, (req, res, next) => {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access Denied: Super Admin Only' });
    }
    controllers.addDistrict(req, res, next);
  });

  router.put('/districts/:id', verifyToken, (req, res, next) => {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access Denied: Super Admin Only' });
    }
    controllers.editDistrict(req, res, next);
  });

  router.post('/cities', verifyToken, (req, res, next) => {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access Denied: Super Admin Only' });
    }
    controllers.addCity(req, res, next);
  });

  router.put('/cities/:id', verifyToken, (req, res, next) => {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access Denied: Super Admin Only' });
    }
    controllers.editCity(req, res, next);
  });

  router.post('/pincodes', verifyToken, (req, res, next) => {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access Denied: Super Admin Only' });
    }
    controllers.addPincode(req, res, next);
  });

  router.put('/pincodes/:id', verifyToken, (req, res, next) => {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access Denied: Super Admin Only' });
    }
    controllers.editPincode(req, res, next);
  });

  router.get('/districts', verifyToken, controllers.getDistricts);
  router.get('/cities', verifyToken, controllers.getCities);
  router.get('/pincodes', verifyToken, controllers.getPincodes);

  return router;
};