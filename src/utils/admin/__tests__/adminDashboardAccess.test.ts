import {
  ADMIN_ROLE_DASHBOARD_SCREENS,
  canAccessAdminDashboardScreen,
} from '../adminDashboardAccess';

describe('canAccessAdminDashboardScreen', () => {
  it('denies the user role for every admin screen', () => {
    expect(canAccessAdminDashboardScreen('user', 'AdminDashboard')).toBe(false);
    expect(canAccessAdminDashboardScreen('user', 'ManageResources')).toBe(false);
  });

  it('allows plain admin only for the dashboard and scoped content screens', () => {
    expect(canAccessAdminDashboardScreen('admin', 'AdminDashboard')).toBe(true);

    for (const screen of ADMIN_ROLE_DASHBOARD_SCREENS) {
      expect(canAccessAdminDashboardScreen('admin', screen)).toBe(true);
    }

    expect(canAccessAdminDashboardScreen('admin', 'ManageCourses')).toBe(false);
    expect(canAccessAdminDashboardScreen('admin', 'ManageUsers')).toBe(false);
    expect(canAccessAdminDashboardScreen('admin', 'ManageRoles')).toBe(false);
    expect(canAccessAdminDashboardScreen('admin', 'AdminNotifications')).toBe(
      false,
    );
  });

  it('allows superadmin every admin screen including Roles', () => {
    expect(canAccessAdminDashboardScreen('superadmin', 'AdminDashboard')).toBe(
      true,
    );
    expect(canAccessAdminDashboardScreen('superadmin', 'ManageRoles')).toBe(
      true,
    );
    expect(canAccessAdminDashboardScreen('superadmin', 'ManageCourses')).toBe(
      true,
    );
    expect(
      canAccessAdminDashboardScreen('superadmin', 'ManageResources'),
    ).toBe(true);
  });
});
