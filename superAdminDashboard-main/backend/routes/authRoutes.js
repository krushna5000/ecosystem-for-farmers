


const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');

module.exports = (controllers) => {
  const router = express.Router();

  // Verify all controller functions exist
  const requiredControllers = [
    'login',
    'logout',
    'addRoleBasedAdmin',
    'getAllAdmins',
    'updateAdmin',
    'deleteAdmin',
    'assignPermissions',
    'getDeactivationRequestedVendors',
    'approveVendorDeactivation',
    'rejectVendorDeactivation',
    'approveReactivation',
    'rejectReactivation'
    
  ];

  requiredControllers.forEach((ctrl) => {
    if (!controllers[ctrl]) {
      console.error(`Error: Controller function '${ctrl}' is undefined`);
    }
  });

  // Public Route: Login
  router.post('/login', controllers.login);

  // Protected Route: Logout
  router.post('/logout', verifyToken, controllers.logout);

  // Protected Routes: Admin Management
  router.post('/addRoleBasedAdmin', verifyToken, controllers.addRoleBasedAdmin);
  router.get('/getAllAdmins', verifyToken, controllers.getAllAdmins);
  router.put('/update-admin/:id', verifyToken, controllers.updateAdmin);
  router.delete('/delete-admin/:id', verifyToken, controllers.deleteAdmin);
  router.post('/assign-permissions', verifyToken, controllers.assignPermissions);

  // Protected Routes: Vendor Management
  router.get('/vendors/getVendors', verifyToken, controllers.getDeactivationRequestedVendors);
  router.put('/vendors/approveDeactivation/:id', verifyToken, controllers.approveVendorDeactivation);
  router.put('/vendors/reject-deactivation/:id', verifyToken, controllers.rejectVendorDeactivation);
  router.post('/vendors/approve-reactivation/:id', verifyToken, controllers.approveReactivation);
  router.post('/vendors/reject-reactivation/:id', verifyToken, controllers.rejectReactivation);


  return router;
};